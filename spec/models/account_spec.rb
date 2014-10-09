require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Account, :type => :model do
	context "non-investment account" do
		it_behaves_like Transactable do
			let(:context_factory) { :bank_account }
			let(:ledger_json_key) { :primary_account }
			let(:expected_transactions_filter) { "" }
			let(:expected_closing_balances) { {:with_date => 999, :without_date => 999 } }
		end
	end

	context "investment account" do
		it_behaves_like Transactable do
			let(:context_factory) { :investment_account }
			let(:ledger_json_key) { :primary_account }
			let(:expected_transactions_filter) { "" }
			let(:expected_closing_balances) { {:with_date => 999, :without_date => 999 } }
		end
	end

	describe "ledger" do
		# Custom matcher that checks if a set of transactions are all unreconciled
		matcher :all_be_unreconciled do
			match do |transactions|
				transactions.none? {|transaction| transaction[:status].eql? "Reconciled"}
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
end
