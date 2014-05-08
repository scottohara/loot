require 'test_helper'

describe Account do
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
end
