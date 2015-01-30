require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Account, type: :model do
	context "non-investment account" do
		it_behaves_like Transactable do
			let(:context_factory) { :bank_account }
			let(:ledger_json_key) { :primary_account }
			let(:expected_closing_balances) { {with_date: 999, without_date: 999 } }
		end
	end

	context "investment account" do
		it_behaves_like Transactable do
			let(:context_factory) { :investment_account }
			let(:ledger_json_key) { :primary_account }
			let(:expected_closing_balances) { {with_date: 999, without_date: 999 } }
		end
	end

	describe "::list" do
		subject { described_class }
		# Accounts for non-investment transactions
		let!(:bank_account) { create :bank_account }
		let!(:another_bank_account) { create :bank_account }

		# Accounts for investment transactions
		let!(:related_bank_account) { create :bank_account, opening_balance: 0 }
		let!(:investment_account) { create :investment_account, related_account: related_bank_account }

		# Second investment account with no related cash account (should be ignored)
		let!(:another_investment_account) { create :investment_account, related_account: nil }

		let(:json) { {
			"Bank accounts" => {
				accounts: [
					{
						id: bank_account.id,
						name: bank_account.name,
						status: bank_account.status,
						closing_balance: bank_account.closing_balance.to_f,
						related_account_id: bank_account.related_account_id
					},
					{
						id: another_bank_account.id,
						name: another_bank_account.name,
						status: another_bank_account.status,
						closing_balance: another_bank_account.closing_balance.to_f,
						related_account_id: another_bank_account.related_account_id
					}
				],
				total: bank_account.closing_balance.to_f + another_bank_account.closing_balance.to_f
			},
			"Investment accounts" => {
				accounts: [
					{
						id: investment_account.id,
						name: investment_account.name,
						status: investment_account.status,
						closing_balance: investment_account.closing_balance.to_f,
						related_account_id: investment_account.related_account_id
					}
				],
				total: investment_account.closing_balance.to_f
			}
		}}

		it "should return the list of accounts and their balances" do
			create :basic_expense_transaction, account: bank_account
			create :basic_income_transaction, account: bank_account
			create :transfer_transaction, source_account: bank_account, destination_account: another_bank_account
			create :transfer_transaction, destination_account: bank_account, source_account: another_bank_account
			create :split_to_transaction, account: bank_account, subtransactions: 1, subtransfers: 1, subtransfer_account: another_bank_account
			create :split_from_transaction, account: bank_account, subtransactions: 1, subtransfers: 1, subtransfer_account: another_bank_account
			create :subtransfer_to_transaction, account: bank_account, parent: create(:split_transaction, account: another_bank_account)
			create :subtransfer_from_transaction, account: bank_account, parent: create(:split_transaction, account: another_bank_account)
			create :payslip_transaction, account: bank_account, subtransactions: 1, subtransfers: 1, subtransfer_account: another_bank_account
			create :loan_repayment_transaction, account: bank_account, subtransactions: 1, subtransfers: 1, subtransfer_account: another_bank_account
			create :security_purchase_transaction, cash_account: related_bank_account, investment_account: investment_account
			create :security_sale_transaction, cash_account: related_bank_account, investment_account: investment_account
			create :dividend_transaction, cash_account: bank_account, investment_account: investment_account

			# Scheduled transaction (should be ignored)
			create :basic_expense_transaction, :scheduled, account: bank_account

			expect(subject.list).to eq json
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
				_, transactions, _ = subject.ledger({unreconciled: 'true'})

				expect(transactions.size).to eq 2
				expect(transactions).to all_be_unreconciled
			end
		end
	end

	describe "#reconcile" do
		subject { create :account, transactions: 2, reconciled: 1 }

		it "should mark all cleared transactions as reconciled" do
			trx = subject.transaction_accounts.where(status: nil).first
			trx.update_attributes(status: "Cleared")

			subject.reconcile

			expect(subject.transaction_accounts.where(status: 'Cleared').size).to eq 0
			expect(subject.transaction_accounts.where(status: 'Reconciled').size).to eq 2
		end
	end

	describe "#as_json" do
		subject { create(:account, name: "Test Account", transactions: 1) }
		let(:json) { subject.as_json }

		it "should return a JSON representation" do
			expect(json).to include(id: subject.id)
			expect(json).to include(name: "Test Account")
			expect(json).to include(account_type: "bank")
			expect(json).to include(opening_balance: 1000)
			expect(json).to include(status: "open")
			expect(json).to include(closing_balance: subject.closing_balance)
			expect(json).to include(num_transactions: 1)
		end
	end
end
