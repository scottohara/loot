# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Account, type: :model do
	context 'non-investment account' do
		it_behaves_like Transactable do
			let(:context_factory) { :bank_account }
			let(:ledger_json_key) { :primary_account }
			let(:expected_closing_balances) { {with_date: 999, without_date: 999} }
		end
	end

	context 'investment account' do
		it_behaves_like Transactable do
			let(:context_factory) { :investment_account }
			let(:ledger_json_key) { :primary_account }
			let(:expected_closing_balances) { {with_date: 999, without_date: 999} }
		end
	end

	describe 'before_destroy' do
		subject(:account) { create :bank_account, account_type: account_type, related_account: related_account }

		let!(:related_account) { create :cash_account }

		before do
			allow(related_account).to receive :destroy!
			account.destroy!
		end

		context 'non-investment account' do
			let(:account_type) { 'bank' }

			it 'should not delete the related account' do
				expect(related_account).not_to have_received :destroy!
			end
		end

		context 'investment account' do
			let(:account_type) { 'investment' }

			it 'should delete the related account' do
				expect(related_account).to have_received :destroy!
			end
		end
	end

	describe '::list' do
		subject(:account) { described_class }

		# Accounts for non-investment transactions
		let!(:bank_account) { create :bank_account }
		let!(:another_bank_account) { create :bank_account, :favourite }

		# Accounts for investment transactions
		let!(:related_bank_account) { create :bank_account, opening_balance: 0 }
		let!(:investment_account) { create :investment_account, related_account: related_bank_account }

		# Loan account with related asset
		let!(:asset_account) { create :asset_account }
		let!(:loan_account) { create :loan_account, related_account: asset_account }

		# Loan account without related asset
		let!(:another_loan_account) { create :loan_account }

		let(:json) do
			{
				'Asset accounts' => {
					accounts: [
						{
							id: asset_account.id,
							name: asset_account.name,
							account_type: asset_account.account_type,
							status: asset_account.status,
							favourite: false,
							opening_balance: asset_account.opening_balance.to_f,
							closing_balance: asset_account.closing_balance.to_f,
							related_account: {
								id: asset_account.related_account_id,
								name: nil,
								account_type: nil,
								opening_balance: nil,
								status: nil
							}
						}
					],
					total: asset_account.closing_balance.to_f
				},
				'Bank accounts' => {
					accounts: [
						{
							id: bank_account.id,
							name: bank_account.name,
							account_type: bank_account.account_type,
							status: bank_account.status,
							favourite: false,
							opening_balance: bank_account.opening_balance.to_f,
							closing_balance: bank_account.closing_balance.to_f,
							related_account: {
								id: bank_account.related_account_id,
								name: nil,
								account_type: nil,
								opening_balance: nil,
								status: nil
							}
						},
						{
							id: another_bank_account.id,
							name: another_bank_account.name,
							account_type: another_bank_account.account_type,
							status: another_bank_account.status,
							favourite: true,
							opening_balance: another_bank_account.opening_balance.to_f,
							closing_balance: another_bank_account.closing_balance.to_f,
							related_account: {
								id: another_bank_account.related_account_id,
								name: nil,
								account_type: nil,
								opening_balance: nil,
								status: nil
							}
						}
					],
					total: bank_account.closing_balance.to_f + another_bank_account.closing_balance.to_f
				},
				'Investment accounts' => {
					accounts: [
						{
							id: investment_account.id,
							name: investment_account.name,
							account_type: investment_account.account_type,
							status: investment_account.status,
							favourite: false,
							opening_balance: investment_account.opening_balance.to_f,
							closing_balance: investment_account.closing_balance.to_f,
							related_account: {
								id: related_bank_account.id,
								name: related_bank_account.name,
								account_type: related_bank_account.account_type,
								opening_balance: related_bank_account.opening_balance.to_f,
								status: related_bank_account.status
							}
						}
					],
					total: investment_account.closing_balance.to_f
				},
				'Loan accounts' => {
					accounts: [
						{
							id: loan_account.id,
							name: loan_account.name,
							account_type: loan_account.account_type,
							status: loan_account.status,
							favourite: false,
							opening_balance: loan_account.opening_balance.to_f,
							closing_balance: loan_account.closing_balance.to_f,
							related_account: {
								id: asset_account.id,
								name: asset_account.name,
								account_type: asset_account.account_type,
								opening_balance: asset_account.opening_balance.to_f,
								status: asset_account.status
							}
						},
						{
							id: another_loan_account.id,
							name: another_loan_account.name,
							account_type: another_loan_account.account_type,
							status: another_loan_account.status,
							favourite: false,
							opening_balance: another_loan_account.opening_balance.to_f,
							closing_balance: another_loan_account.closing_balance.to_f,
							related_account: {
								id: another_loan_account.related_account_id,
								name: nil,
								account_type: nil,
								opening_balance: nil,
								status: nil
							}
						}
					],
					total: loan_account.closing_balance.to_f + another_loan_account.closing_balance.to_f
				}
			}
		end

		it 'should return the list of accounts and their balances' do
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

			# Second investment account with no related cash account (should be ignored)
			create :investment_account, related_account: nil

			# Scheduled transaction (should be ignored)
			create :basic_expense_transaction, :scheduled, account: bank_account

			expect(account.list).to eq json
		end
	end

	matcher :match_json do |expected, related_account|
		match do |actual|
			actual.name.eql?(expected['name']) &&
				actual.account_type.eql?(expected['account_type']) &&
				actual.opening_balance.eql?(expected['opening_balance']) &&
				actual.status.eql?(expected['status']) &&
				actual.favourite.eql?(expected['favourite']) &&
				if related_account.nil?
					actual.related_account.nil?
				else
					actual.related_account.name.eql?(related_account.name) &&
						actual.related_account.account_type.eql?(related_account.account_type) &&
						actual.related_account.opening_balance.eql?(related_account.opening_balance) &&
						actual.related_account.status.eql?(related_account.status)
				end
		end
	end

	describe '::create_from_json' do
		shared_examples 'create from json', :account_create_from_json do
			it 'should create an account from a JSON representation' do
				expect(described_class.create_from_json json).to match_json json, related_account
			end
		end

		let(:json) do
			{
				'name' => 'Test account',
				'account_type' => 'bank',
				'opening_balance' => 100,
				'status' => 'open',
				'favourite' => true
			}
		end
		let(:related_account) { nil }

		context('standard account', account_create_from_json: true) {}

		context 'investment account' do
			let(:related_account) { described_class.new name: 'Test account (Cash)', account_type: 'bank', opening_balance: 200, status: 'open', favourite: true }

			before do
				json['account_type'] = 'investment'
				json['related_account'] = {'opening_balance' => 200}
			end

			it 'should create an account from a JSON representation' do
				account = described_class.create_from_json json
				related_account.id = account.related_account.id
				related_account.related_account = account
				expect(account).to match_json json, related_account
			end
		end

		context 'loan account' do
			before do
				json['account_type'] = 'loan'
			end

			context 'with asset', account_create_from_json: true do
				let(:related_account) { create :asset_account, :favourite }

				before do
					json['related_account'] = {'id' => related_account.id}
				end
			end

			context('without asset', account_create_from_json: true) {}
		end
	end

	describe '::update_from_json' do
		shared_examples 'update from json', :account_update_from_json do
			it 'should update an account from a JSON representation' do
				expect(described_class.update_from_json json).to match_json json, related_account
			end
		end

		let(:json) do
			{
				:id => 1,
				'name' => 'Test account',
				'account_type' => 'cash',
				'opening_balance' => 100,
				'status' => 'closed',
				'favourite' => true
			}
		end
		let(:related_account) { nil }

		before do
			expect(described_class).to receive_message_chain(:includes, :find).with(json[:id]).and_return account
		end

		context 'investment account' do
			let(:related_account) { create :bank_account, name: 'Test account (Cash)', opening_balance: 200, status: 'closed', favourite: true }

			before do
				json['account_type'] = 'investment'
				json['related_account'] = {'opening_balance' => 200}
			end

			context 'from investment account', account_update_from_json: true do
				let(:account) { create :investment_account, :favourite, related_account: create(:cash_account, :favourite) }
			end

			context 'from non-investment account', account_update_from_json: true do
				let(:account) { create :bank_account, :favourite }
			end
		end

		context 'non-investment account' do
			let(:account) { create :investment_account, :favourite, related_account: create(:cash_account, :favourite) }

			before do
				expect(account.related_account).to receive :destroy!
			end

			context 'loan account' do
				before do
					json['account_type'] = 'loan'
				end

				context 'with asset', account_update_from_json: true do
					let(:related_account) { create :asset_account, :favourite }

					before do
						json['related_account'] = {'id' => related_account.id}

						expect(described_class).to receive(:find).with(related_account.id).and_return related_account
					end
				end

				context('without asset', account_update_from_json: true) {}
			end

			context('standard account', account_update_from_json: true) {}
		end
	end

	describe '#ledger' do
		# Custom matcher that checks if a set of transactions are all unreconciled
		matcher :all_be_unreconciled do
			match do |transactions|
				transactions.none? { |transaction| transaction[:status].eql? 'Reconciled' }
			end
		end

		context 'when unreconciled parameter is passed' do
			subject(:account) { create :account, transactions: 2, reconciled: 1 }

			it 'should include only unreconciled transactions' do
				_, transactions = account.ledger unreconciled: 'true'

				expect(transactions.size).to eq 2
				expect(transactions).to all_be_unreconciled
			end
		end
	end

	describe '#reconcile' do
		subject(:account) { create :account, transactions: 2, reconciled: 1 }

		it 'should mark all cleared transactions as reconciled' do
			trx = account.transaction_accounts.where(status: nil).first
			trx.update! status: 'Cleared'

			account.reconcile

			expect(account.transaction_accounts.where(status: 'Cleared').size).to eq 0
			expect(account.transaction_accounts.where(status: 'Reconciled').size).to eq 2
		end
	end

	describe '#as_json' do
		subject(:account) { create :account, name: 'Test Account', transactions: 1 }

		after do
			expect(json).to include id: account.id
			expect(json).to include name: 'Test Account'
			expect(json).to include account_type: 'bank'
			expect(json).to include opening_balance: 1000
			expect(json).to include status: 'open'
			expect(json).to include favourite: false
		end

		context 'with default options' do
			let(:json) { account.as_json }

			before do
				expect(ActiveModelSerializers::SerializableResource).to receive(:new).with(account, fields: %i[id name account_type opening_balance status favourite]).and_call_original
			end

			it('should return a JSON representation') do
				expect(json).not_to include :related_account
			end
		end

		context 'with empty options' do
			let(:json) { account.as_json({}) }

			before do
				expect(ActiveModelSerializers::SerializableResource).to receive(:new).with(account, {}).and_call_original
			end

			after do
				expect(json).to include closing_balance: account.closing_balance
				expect(json).to include num_transactions: 1
			end

			context 'without related account' do
				it 'should return a JSON representation with no related account' do
					expect(json).to include related_account: nil
				end
			end

			context 'with related account' do
				let(:related_account) { json[:related_account] }

				before do
					account.related_account = create :account, name: 'Related Account'
					expect(ActiveModelSerializers::SerializableResource).to receive(:new).with(account.related_account, fields: %i[id name account_type opening_balance status]).and_call_original
				end

				it 'should return a JSON representation including related account' do
					expect(related_account).to include id: account.related_account.id
					expect(related_account).to include name: 'Related Account'
					expect(related_account).to include account_type: 'bank'
					expect(related_account).to include opening_balance: 1000
					expect(related_account).to include status: 'open'
				end
			end
		end
	end
end
