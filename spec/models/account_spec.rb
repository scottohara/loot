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

	describe "#ledger" do
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

	describe "#reconcile" do
		subject { create :account, transactions: 2, reconciled: 1 }

		it "should mark all cleared transactions as reconciled" do
			trx = subject.transaction_accounts.where(:status => nil).first
			trx.update_attributes(:status => "Cleared")

			subject.reconcile

			expect(subject.transaction_accounts.where(:status => 'Cleared').size).to eq 0
			expect(subject.transaction_accounts.where(:status => 'Reconciled').size).to eq 2
		end
	end

	describe "#as_json" do
		subject { create(:account, name: "Test Account", transactions: 1) }
		let(:json) { subject.as_json }

		it "should return a JSON representation" do
			expect(json).to include(:id => subject.id)
			expect(json).to include(:name => "Test Account")
			expect(json).to include(:account_type => "bank")
			expect(json).to include(:opening_balance => 1000)
			expect(json).to include(:status => "open")
			expect(json).to include(:closing_balance => subject.closing_balance)
			expect(json).to include(:num_transactions => 1)
		end
	end
end
