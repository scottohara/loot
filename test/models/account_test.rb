require 'test_helper'
#require 'models/concerns/transactable_spec'

describe Account do
	describe "ledger" do
		before(:all) do
			# Reopen the module and change the size of the result set to just 5 transactions
			module Transactable
				self.send(:remove_const, "NUM_RESULTS")
				self.const_set("NUM_RESULTS", 5)
			end
		end

		subject { accounts(:bank_account) }

		it "should return the earliest set of transactions, including reconciled ones" do
			@scenario = {
				:opts => {:as_at => "2014-01-03", :direction => :prev},
				:expected_opening_balance => 1500,
				:expected_transactions => [:basic, :basic_reconciled, :transfer, :transfer_reconciled],
				:expected_at_end? => true
			}
		end

		it "should return an earlier set of transactions, including reconciled ones" do
			@scenario = {
				:opts => {:as_at => "2014-01-04", :direction => :prev},
				:expected_opening_balance => 1300,
				:expected_transactions => [:transfer, :transfer_reconciled, :split_reconciled, :split],
				:expected_at_end? => false
			}
		end

		it "should return a later set of transactions, including reconciled ones" do
			@scenario = {
				:opts => {:as_at => "2014-01-02", :direction => :next},
				:expected_opening_balance => 900,
				:expected_transactions => [:split_reconciled, :split, :payslip_reconciled, :payslip, :loan_repayment],
				:expected_at_end? => false
			}
		end

		it "should return the latest set of transactions, including reconciled ones" do
			@scenario = {
				:opts => {:as_at => "2014-01-03", :direction => :next},
				:expected_opening_balance => 300,
				:expected_transactions => [:payslip_reconciled, :payslip, :loan_repayment, :loan_repayment_reconciled],
				:expected_at_end? => true
			}
		end

		it "should return the earliest set of transactions, excluding reconciled ones" do
			@scenario = {
				:opts => {:as_at => "2014-01-03", :direction => :prev, :unreconciled => "true"},
				:expected_opening_balance => 1200,
				:expected_transactions => [:basic, :transfer],
				:expected_at_end? => true
			}
		end

		it "should return an earlier set of transactions, excluding reconciled ones" do
			@scenario = {
				:opts => {:as_at => "2014-01-04", :direction => :prev, :unreconciled => "true"},
				:expected_opening_balance => 800,
				:expected_transactions => [:transfer, :split],
				:expected_at_end? => false
			}
		end

		it "should return a later set of transactions, excluding reconciled ones" do
			@scenario = {
				:opts => {:as_at => "2014-01-02", :direction => :next, :unreconciled => "true"},
				:expected_opening_balance => 1000,
				:expected_transactions => [:split, :payslip, :loan_repayment],
				:expected_at_end? => false
			}
		end

		it "should return the latest set of transactions, excluding reconciled ones" do
			@scenario = {
				:opts => {:as_at => "2014-01-03", :direction => :next, :unreconciled => "true"},
				:expected_opening_balance => 200,
				:expected_transactions => [:payslip, :loan_repayment],
				:expected_at_end? => true
			}
		end

		after { ledger_assertions @scenario }

		private

		def ledger_assertions(scenario)
			opening_balance, transactions, at_end = subject.ledger scenario[:opts]
			opening_balance.must_equal scenario[:expected_opening_balance]
			transaction_differences(scenario[:expected_transactions], transactions).must_be_nil
			at_end.must_equal scenario[:expected_at_end?]
		end

		def compact(transaction)
			expected_keys = [:id, :transaction_type, :transaction_date, :parent_id, :amount, :quantity, :commission, :price, :direction, :status, :related_status, :memo, :flag]
			nested_keys = {
				:primary_account => [:id, :name, :account_type],
				:payee => [:id, :name],
				:security => [:id, :name],
				:category => [:id, :name],
				:subcategory => [:id, :name],
				:account => [:id, :name]
			}

			# Remove any keys that we don't care about
			transaction = transaction.extract!(*expected_keys, *nested_keys.keys)
			
			# ..and the same for any nested keys
			nested_keys.each do |nested_key, keys|
				unless transaction[nested_key].nil?
					transaction[nested_key] = transaction[nested_key].extract!(*keys)
					transaction[nested_key].compact!
					transaction[nested_key] = nil if transaction[nested_key].empty?
				end
			end

			# Category/subcategory IDs need to be strings
			transaction[:category][:id] = transaction[:category][:id].to_s if transaction[:category]
			transaction[:subcategory][:id] = transaction[:subcategory][:id].to_s if transaction[:subcategory]

			# Remove any nil values
			transaction.compact
		end

		def transaction_differences(expected, actual)
			# Make sure the array lengths match
			return [expected.size, actual.size] unless expected.size.eql? actual.size 

			diff = nil

			# Check each expected transaction against it's actual counterpart
			expected.each_with_index do |trx, index|
				# Convert the expected transaction to JSON and compact
				expected_json = compact(transactions(trx).as_subclass.as_json({:direction => 'outflow'}))

				# Compact the actual transaction
				actual_json = compact(actual[index])

				# Break if we find a mismatch
				unless expected_json.hash.eql? actual_json.hash
					diff = {
						:expected => expected_json.delete_if {|key,value| actual_json[key].eql? value },
						:actual => actual_json.extract!(expected_json.keys)
					}
					break
				end
			end

			diff
		end
	end

	#include TransactableSpec
	#ledger_specs
	
=begin
	let(:valid_attributes) { {:name => 'Test Account', :account_type => 'bank', :opening_balance => 100, :status => 'open'} }
	let(:account) { Account.new valid_attributes }
	let(:existing_account) { accounts(:bank_account) }

	it "should be valid with valid attributes" do
		account.must_be :valid?
	end

	it "should be invalid without a name or" do
		valid_attributes.delete :name
		account.wont_be :valid?
	end

	it "should be invalid without an opening balance" do
		valid_attributes.delete :opening_balance
		account.wont_be :valid?
	end

	it "should be invalid without a type" do
		valid_attributes.delete :account_type
		account.wont_be :valid?
	end

	it "should be invalid if type is invalid" do
		valid_attributes[:account_type] = 'not a valid type'
		account.wont_be :valid?
	end

	it "should be invalid without a status" do
		valid_attributes.delete :status
		account.wont_be :valid?
	end

	it "should be invalid if status is invalid" do
		valid_attributes[:status] = 'not a valid status'
		account.wont_be :valid?
	end

	describe "account list" do
		let(:bank_account) { accounts(:bank_account) }
		let(:credit_account) { accounts(:credit_account) }
		let(:investment_account) { accounts(:investment_account) }
		let(:cash_account) { accounts(:cash_account) }
		let(:old_investment_account) { accounts(:old_investment_account) }
		let(:old_cash_account) { accounts(:old_cash_account) }
		let(:loan_account) { accounts(:loan_account) }
		let(:account_list) do
			def account_for_list(account, related_account = nil)
				{
					:id => account.id,
					:name => account.name,
					:status => account.status,
					:closing_balance => account.opening_balance.to_f + (related_account && related_account.opening_balance.to_f || 0),
					:related_account_id => account.related_account_id
				}
			end

			{
				"Bank accounts" => {
					:accounts => [ account_for_list(bank_account) ],
					:total => bank_account.opening_balance.to_f
				},
				"Credit accounts" => {
					:accounts => [ account_for_list(credit_account) ],
					:total => credit_account.opening_balance.to_f
				},
				"Investment accounts" => {
					:accounts => [ account_for_list(investment_account, cash_account), account_for_list(old_investment_account, old_cash_account) ],
					:total => [investment_account.opening_balance.to_f, cash_account.opening_balance.to_f, old_investment_account.opening_balance.to_f, old_cash_account.opening_balance.to_f].reduce(:+)
				},
				"Loan accounts" => {
					:accounts => [ account_for_list(loan_account) ],
					:total => loan_account.opening_balance.to_f
				}
			}
		end

		it "should return a list of accounts and balances" do
			Account.account_list.must_equal account_list
		end
	end

=begin
	describe "when asked for a category" do
		it "should return an existing category" do
			category = Category.find_or_new({'id' => existing_category.id})
			category.must_be_instance_of Category
			category.must_equal existing_category
		end

		it "should create a non-existing top-level category" do
			category = Category.find_or_new category_name
			category.must_be_instance_of Category
			category.id.must_be_nil
			category.name.must_equal category_name
			category.direction.must_equal 'outflow'
		end

		let(:parent_outflow_category) { categories(:groceries) }

		it "should create a non-existing outflow subcategory" do
			category = Category.find_or_new category_name, parent_outflow_category
			category.must_be_instance_of Category
			category.id.must_be_nil
			category.name.must_equal category_name
			category.direction.must_equal 'outflow'
			category.parent.must_equal parent_outflow_category
		end

		let(:parent_inflow_category) { categories(:employment) }

		it "should create a non-existing inflow subcategory" do
			category = Category.find_or_new category_name, parent_inflow_category
			category.must_be_instance_of Category
			category.id.must_be_nil
			category.name.must_equal category_name
			category.direction.must_equal 'inflow'
			category.parent.must_equal parent_inflow_category
		end
	end
=end

=begin
	describe "when asked for a JSON representation" do
		let(:json) { {"id" => existing_account.id, "name" => existing_account.name, "account_type" => existing_account.account_type, "opening_balance" => existing_account.opening_balance, "status" => existing_account.status} }

		it "should return a JSON-like hash" do
			existing_account.as_json.must_equal json
		end
	end
=end

=begin
	describe "account list" do
		let(:bank_account) { FactoryGirl.create(:bank_account) }

		let(:number_of_transactions) { 10 }
		let(:transaction_amount) { 100 }
		let(:total_transaction_value) { number_of_transactions * transaction_amount }

		let(:basic_transactions) { FactoryGirl.create_list(:basic_transaction, number_of_transactions, account: bank_account, amount: transaction_amount) }

		let(:account_list) { Account.account_list }

		let(:account_category) { 'Bank accounts' }
		let(:returned_account) { account_list[account_category][:accounts].find { |account| account.name.eql? bank_account.name } }

		it "should include a category for the account type" do
			account_list.must_include account_category
		end

		it "should include the account" do
			returned_account.must_not_be_nil
		end

		it "should calculate the closing balance of the account" do
			returned_account.closing_balance.must_equal(bank_account.opening_balance + total_transaction_value)
		end
	end
=end
end
