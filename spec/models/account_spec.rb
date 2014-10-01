require 'rails_helper'

RSpec.describe Account, :type => :model do
	describe "ledger" do
		before :all do
			# Reopen the module and change the size of the result set to just 8 transactions
			module Transactable
				self.send :remove_const, "NUM_RESULTS"
				self.const_set("NUM_RESULTS", 9)
			end
		end

		# Custom matcher that compares a set of transactions against another set
		matcher :match_ledger_transactions do |expected|
			match do |actual|
				@diffs = []

				# Make sure the array lengths match
				return false unless expected.size.eql? actual.size 

				# Check each expected transaction against it's actual counterpart
				expected.each_with_index do |trx, index|
					# Convert the expected transaction to JSON and compact
					expected_json = compact(trx.as_subclass.as_json({:direction => actual[index][:direction], :primary_account => actual[index][:primary_account][:id]}))

					# Compact the actual transaction
					actual_json = compact(actual[index])

					@diffs << {
						:index => index,
						:type => trx.transaction_type,
						:expected => expected_json.delete_if {|key,value| actual_json[key].eql? value },
						:actual => actual_json.slice(*expected_json.keys)
					} unless expected_json.hash.eql? actual_json.hash
				end

				@diffs.empty?
			end

			failure_message do
				if @diffs.empty?
					# Size mismatch
					"expected #{expected.size} #{"transaction".pluralize} but got #{actual.size}"
				else
					# Content mismatch
					@diffs.reduce("") do |message, diff|
						message += "Transaction #:\t#{diff[:index]} (#{diff[:type]})\n"
						message += "Expected:\t#{diff[:expected]}\n"
						message += "Actual:\t\t#{diff[:actual]}\n\n"
					end
				end
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
		end

		# Custom matcher that checks if a set of transactions are all for a particular account
		matcher :all_belong_to do |account|
			match do |transactions|
				transactions.reject! do |transaction|
					transaction[:primary_account][:id].eql? account.id
				end

				transactions.empty?
			end
		end

		# Custom matcher that checks if a set of transactions are all unreconciled
		matcher :all_be_unreconciled do
			match do |transactions|
				transactions.select! do |transaction|
					transaction[:status].eql? "Reconciled"
				end

				transactions.empty?
			end
		end

		context "non-investment account", :spec_type => :account_type do
			it "should handle all types of transactions" do
				@account = create(:bank_account, :all_transaction_types)
			end
		end

		context "investment account", :spec_type => :account_type do
			it "should handle all types of transactions" do
				@account = create(:investment_account, :all_transaction_types)
			end
		end

		after :each, :spec_type => :account_type do
			_, transactions, _ = @account.ledger

			expect(transactions).to match_ledger_transactions(@account.transactions)
		end

		before :each, :spec_type => :inclusion do
			@account = create(:account, transactions: 2, reconciled: 1)
		end

		it "should only include transactions belonging to the account", :spec_type => :inclusion do
			# Another account with transactions
			create(:account, transactions: 2)

			_, transactions, _ = @account.ledger

			expect(transactions.size).to eq 3
			expect(transactions).to all_belong_to(@account)
		end
		
		context "when unreconciled parameter is passed", :spec_type => :inclusion do
			it "should include only unreconciled transactions" do
				_, transactions, _ = @account.ledger({:unreconciled => 'true'})

				expect(transactions.size).to eq 2
				expect(transactions).to all_be_unreconciled
			end
		end

		context "when fetching backwards", :spec_type => :range do
			before :each do
				@direction = :prev
			end

			context "when the date is near the start of the range" do
				it "should return the earliest set of transactions" do
					@range = 0..4
					@at_end = true
				end
			end

			context "when the date is not near the start of the range" do
				it "should return an earlier set of transactions" do
					@range = 2..9
					@at_end = false
				end
			end

			after :each do
				@as_at = @range.last + 1
			end
		end

		context "when fetching forwards", :spec_type => :range do
			before :each do
				@direction = :next
			end

			context "when the date is not near the end of the range" do
				it "should return a later set of transactions" do
					@range = 2..10
					@at_end = false
				end
			end

			context "when the date is near the end of the range" do
				it "should return the last set of transactions" do
					@range = 10..14
					@at_end = true
				end
			end

			after :each do
				@as_at = @range.first - 1
			end
		end

		after :each, :spec_type => :range do
			# Create an account with 15 basic transactions
			account = create(:account, transactions: 15)

			# Get the date of the first transaction
			start_date = account.transactions.first.becomes(BasicTransaction).header.transaction_date

			# Get the ledger
			_, transactions, at_end = account.ledger({:as_at => (start_date + @as_at).to_s, :direction => @direction})

			expect(transactions.size).to eq @range.size
			expect(transactions.first[:transaction_date]).to eq (start_date + @range.first)
			expect(transactions.last[:transaction_date]).to eq (start_date + @range.last)
			expect(at_end).to be @at_end
		end
	end

	describe "closing_balance" do
		context "investment account" do
			let(:account) { create(:investment_account, :all_transaction_types) }

			it "should return the opening balance as at a given date" do
				
			end
		end

		context "non-investment account" do
			let(:account) { create(:bank_account, :all_transaction_types) }

			it "should return the closing balance as the passed date" do
				_, transactions, _ = account.ledger
				expect(account.closing_balance({:as_at => as_at})).to eq 1
			end

			context "when a date is not passed" do
				it "should return the closing balance as at today" do
					expect(account.closing_balance).to eq 1
				end
			end
		end
	end

	describe "ledger_options" do
		before :each do
			@account = Account.new
		end

		it "should set default values for missing options" do
			opts = @account.ledger_options

			expect(opts[:as_at]).to eq "2400-12-31"
			expect(opts[:direction]).to eq :prev
			expect(opts[:unreconciled]).to be false
		end

		it "should set default values for invalid options" do
			opts = @account.ledger_options({
				:as_at => "invalid",
				:direction => "invalid",
				:unreconciled => "invalid"
			})

			expect(opts[:as_at]).to eq "2400-12-31"
			expect(opts[:direction]).to eq :prev
			expect(opts[:unreconciled]).to be false
		end

		it "should retain any valid options provided" do
			opts = @account.ledger_options({
				:as_at => "2014-01-01",
				:direction => "next",
				:unreconciled => "true"
			})

			expect(opts[:as_at]).to eq "2014-01-01"
			expect(opts[:direction]).to eq :next
			expect(opts[:unreconciled]).to be true
		end
	end

	describe "drop_opening_date" do
		before :each do
			@account = Account.new
			@transactions = [
				{"transaction_date" => "2014-01-02"},
				{"transaction_date" => "2014-01-01"},
				{"transaction_date" => "2014-01-01"}
			]
		end

		context "when at end" do
			it "should return the transactions in reverse order" do
				@transactions = @account.drop_opening_date @transactions, true, nil

				expect(@transactions.size).to eq 3
				expect(@transactions.first["transaction_date"]).to eq "2014-01-01"
				expect(@transactions.last["transaction_date"]).to eq "2014-01-02"
			end
		end

		context "when not at end" do
			it "should remove any transactions for the opening date and return the rest in reverse order" do
				@transactions = @account.drop_opening_date @transactions, false, "2014-01-01"

				expect(@transactions.size).to eq 1
				expect(@transactions).to include({"transaction_date" => "2014-01-02"})
			end
		end
	end

	describe "ledger_opening_balance" do
		before :each do
			@account = Account.new
		end

		context "when fetching backwards" do
			before :each do
				@opts = {:direction => :prev}
			end

			context "when at end" do
				it "should return the context's opening balance" do
					expect(@account).to receive :opening_balance

					@account.ledger_opening_balance @opts, true, nil
				end
			end

			context "when not at end" do
				it "should return the context's closing balance at the closing date" do
					expect(@account).to receive(:closing_balance) { "2014-01-01" }

					@account.ledger_opening_balance @opts, false, "2014-01-01"
				end
			end
		end

		context "when fetching forwards" do
			before :each do
				@opts = {
					:direction => :next,
					:as_at => "2014-01-02"
				}
			end

			it "should return the context's closing balance at the passed date" do
				expect(@account).to receive(:closing_balance) { "2014-01-02" }

				@account.ledger_opening_balance @opts, nil, nil
			end
		end
	end

	describe "exclude_reconciled" do
		before :each do
			@opening_balance, @transactions = Account.new.exclude_reconciled 100, [
				{"status" => "Reconciled", "amount" => 10, "direction" => "inflow"},	# +$10 inflow
				{"status" => "Reconciled", "amount" => 5, "direction" => "outflow"},	# -$5	outflow
				{"status" => "Reconciled", "amount" => nil, "direction" => "inflow"},	# ignore, amount is nil
				{"status" => nil, "amount" => 10, "direction" => "inflow"}						# ignore, unreconciled
			]
		end

		it "should update the opening balance with the amounts of any reconciled transactions" do
			expect(@opening_balance).to eq 105
		end

		it "should remove any reconciled transactions" do
			expect(@transactions.size).to eq 1
			expect(@transactions.first).to include({"status" => nil, "amount" => 10, "direction" => "inflow"})
		end
	end
end
