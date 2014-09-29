require 'rails_helper'

RSpec.describe Account, :type => :model do
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

	describe "find_for_ledger" do
		context "non-investment account" do
			it "should handle all types of transactions" do
				# TODO
			end
		end

		context "investment account" do
			it "should handle all types of transactions" do
				# TODO
			end
		end

		after :each do
			#transactions = @account.find_for_ledger
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

		context "at end" do
			it "should return the transactions in reverse order" do
				@transactions = @account.drop_opening_date @transactions, true, nil
				expect(@transactions.size).to eq 3
				expect(@transactions.first["transaction_date"]).to eq "2014-01-01"
				expect(@transactions.last["transaction_date"]).to eq "2014-01-02"
			end
		end

		context "not at end" do
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

		context "going backwards" do
			before :each do
				@opts = {:direction => :prev}
			end

			context "at end" do
				it "should return the context's opening balance" do
					expect(@account).to receive :opening_balance
					@account.ledger_opening_balance @opts, true, nil
				end
			end

			context "no at end" do
				it "should return the context's closing balance at the closing date" do
					expect(@account).to receive(:closing_balance) { "2014-01-01" }
					@account.ledger_opening_balance @opts, false, "2014-01-01"
				end
			end
		end

		context "going forwards" do
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

	describe "to_ledger_json" do
		# TODO
	end
end
