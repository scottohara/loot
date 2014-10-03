require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Account, :type => :model do
	context "non-investment account" do
		it_behaves_like Transactable do
			let(:context_factory) { :bank_account }
			let(:ledger_json_key) { :primary_account }
		end
	end

	context "investment account" do
		it_behaves_like Transactable do
			let(:context_factory) { :investment_account }
			let(:ledger_json_key) { :primary_account }
		end
	end

	describe "ledger" do
		# Custom matcher that checks if a set of transactions are all unreconciled
		matcher :all_be_unreconciled do
			match do |transactions|
				transactions.select! do |transaction|
					transaction[:status].eql? "Reconciled"
				end

				transactions.empty?
			end
		end

		context "when unreconciled parameter is passed" do
			subject { create(:account, transactions: 2, reconciled: 1) }

			it "should include only unreconciled transactions" do
				_, transactions, _ = subject.ledger({:unreconciled => 'true'})

				expect(transactions.size).to eq 2
				expect(transactions).to all_be_unreconciled
			end
		end
	end

	describe "closing_balance" do
		context "investment account" do
			let(:account) { create(:investment_account, :with_all_transaction_types) }

			it "should return the closing balance as the passed date" do
				as_at = account.transactions.first.as_subclass.header.transaction_date + 4
				expect(account.closing_balance({:as_at => as_at})).to eq 998
			end

			context "when a date is not passed" do
				it "should return the closing balance as at today" do
					expect(account.closing_balance).to eq 999
				end
			end
		end

		context "non-investment account" do
			let(:account) { create(:bank_account, :with_all_transaction_types) }

			it "should return the closing balance as the passed date" do
				as_at = account.transactions.first.as_subclass.header.transaction_date + 5
				expect(account.closing_balance({:as_at => as_at})).to eq 998
			end

			context "when a date is not passed" do
				it "should return the closing balance as at today" do
					expect(account.closing_balance).to eq 999
				end
			end
		end
	end

end
