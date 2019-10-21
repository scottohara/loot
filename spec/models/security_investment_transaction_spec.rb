# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SecurityInvestmentTransaction, type: :model do
	matcher :match_json do |expected, investment_account, cash_account|
		match do |actual|
			actual.transaction_type.eql?('SecurityInvestment') &&
				actual.id.eql?(expected[:id]) &&
				actual.amount.eql?(expected['amount']) &&
				actual.memo.eql?(expected['memo']) &&
				actual.investment_account.direction.eql?(expected['direction']) &&
				actual.investment_account.status.eql?(expected['status']) &&
				actual.investment_account.account.eql?(investment_account) &&
				actual.cash_account.direction.eql?(expected['direction'].eql?('inflow') && 'outflow' || 'inflow') &&
				actual.cash_account.status.eql?(expected['related_status']) &&
				actual.cash_account.account.eql?(cash_account)
		end
	end

	describe '::create_from_json' do
		let(:security) { create :security }
		let(:investment_account) { create :investment_account }
		let(:cash_account) { create :bank_account }
		let(:json) do
			{
				id: 1,
				'amount' => amount,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => investment_account.id
				},
				'account' => {
					'id' => cash_account.id
				},
				'price' => 2,
				'quantity' => 10,
				'commission' => 5,
				'status' => 'Cleared',
				'related_status' => 'Reconciled'
			}
		end

		before do
			expect(Security).to receive(:find_or_new).with(json['security']).and_return security
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return investment_account
			expect(Account).to receive(:find).with(json['account']['id']).and_return cash_account
			expect_any_instance_of(SecurityTransactionHeader).to receive(:update_from_json).with(json).and_call_original
			expect_any_instance_of(SecurityTransaction).to receive(:validate_presence).with 'quantity'
			expect_any_instance_of(SecurityTransaction).to receive(:validate_presence).with 'price'
			expect_any_instance_of(SecurityTransaction).to receive(:validate_presence).with 'commission'
		end

		after do
			expect(described_class.create_from_json json).to match_json json, investment_account, cash_account
		end

		shared_examples 'create from json', :security_investment_transaction_create_from_json do
			before do |example|
				json['direction'] = example.metadata[:direction]
			end

			context 'unscheduled' do
				it 'should create a transaction from a JSON representation' do
					json['transaction_date'] = Time.zone.today.to_s
					expect(security).to receive(:update_price!).with json['price'], json['transaction_date'], json[:id]
				end
			end

			context 'scheduled' do
				it 'should create a transaction from a JSON representation' do
					json['next_due_date'] = Time.zone.today.to_s
					json['frequency'] = 'Monthly'
					expect(security).not_to receive :update_price!
				end
			end
		end

		context 'outflow', security_investment_transaction_create_from_json: true, direction: 'outflow' do
			let(:amount) { 15 }
		end

		context 'inflow', security_investment_transaction_create_from_json: true, direction: 'inflow' do
			let(:amount) { 25 }
		end
	end

	describe '::update_from_json' do
		let(:security) { create :security }
		let(:investment_account) { create :investment_account }
		let(:cash_account) { create :bank_account }
		let(:transaction) { create :security_investment_transaction }
		let(:json) do
			{
				id: transaction.id,
				'amount' => amount,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => investment_account.id
				},
				'account' => {
					'id' => cash_account.id
				},
				'price' => 2,
				'quantity' => 10,
				'commission' => 5
			}
		end

		before do
			expect(described_class).to receive_message_chain(:includes, :find).with(json[:id]).and_return transaction
			expect(Security).to receive(:find_or_new).with(json['security']).and_return security
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return investment_account
			expect(Account).to receive(:find).with(json['account']['id']).and_return cash_account
			expect(transaction.header).to receive(:update_from_json).with(json).and_call_original
		end

		after do
			expect(described_class.update_from_json json).to match_json json, investment_account, cash_account
		end

		shared_examples 'update from json', :security_investment_transaction_update_from_json do
			before do |example|
				json['direction'] = example.metadata[:direction]
			end

			context 'unscheduled' do
				it 'should update a transaction from a JSON representation' do
					json['transaction_date'] = Time.zone.today.to_s
					expect(security).to receive(:update_price!).with json['price'], json['transaction_date'], json[:id]
				end
			end

			context 'scheduled' do
				it 'should update a transaction from a JSON representation' do
					json['next_due_date'] = Time.zone.today.to_s
					json['frequency'] = 'Monthly'
					expect(security).not_to receive :update_price!
				end
			end
		end

		context 'outflow', security_investment_transaction_update_from_json: true, direction: 'outflow' do
			let(:amount) { 15 }
		end

		context 'inflow', security_investment_transaction_update_from_json: true, direction: 'inflow' do
			let(:amount) { 25 }
		end
	end

	describe '#validate_amount_matches_investment_details' do
		subject(:transaction) { described_class.new }

		before do |example|
			transaction.build_header price: 2, quantity: 10, commission: 5
			transaction.transaction_accounts.build(direction: example.metadata[:direction]).account = create :investment_account
		end

		shared_examples 'validate amount', :validate_amount do
			context "when amount doesn't match the investment details" do
				it 'should be an error' do
					transaction.amount = 1
					transaction.validate_amount_matches_investment_details
					expect(transaction.errors[:base]).to include error_message
				end
			end

			context 'when amount matches the investment details' do
				it 'should not be an error' do
					transaction.amount = valid_amount
					transaction.validate_amount_matches_investment_details
					expect(transaction.errors[:base]).not_to include error_message
				end
			end
		end

		context 'outflow', validate_amount: true, direction: 'outflow' do
			let(:error_message) { 'Amount must equal price times quantity less commission' }
			let(:valid_amount) { 15 }
		end

		context 'inflow', validate_amount: true, direction: 'inflow' do
			let(:error_message) { 'Amount must equal price times quantity plus commission' }
			let(:valid_amount) { 25 }
		end
	end

	describe '#as_json' do
		subject(:transaction) { create :security_investment_transaction, status: 'Reconciled' }

		before do
			expect(transaction.investment_account.account).to receive(:as_json).and_return 'investment account json'
			expect(transaction.cash_account.account).to receive(:as_json).and_return 'cash account json'
		end

		after do
			expect(json).to include amount: 2
			expect(json).to include quantity: 1
			expect(json).to include price: 1
			expect(json).to include commission: 1
		end

		context 'for investment account' do
			let(:json) { transaction.as_json }

			it 'should return a JSON representation' do
				expect(json).to include primary_account: 'investment account json'
				expect(json).to include category: {id: 'Buy', name: 'Buy'}
				expect(json).to include account: 'cash account json'
				expect(json).to include direction: 'inflow'
				expect(json).to include status: 'Reconciled'
				expect(json).to include related_status: nil
			end
		end

		context 'for cash account' do
			let(:json) { transaction.as_json primary_account: transaction.cash_account.account_id }

			it 'should return a JSON representation' do
				expect(json).to include primary_account: 'cash account json'
				expect(json).to include category: {id: 'TransferTo', name: 'Transfer To'}
				expect(json).to include account: 'investment account json'
				expect(json).to include direction: 'outflow'
				expect(json).to include status: nil
				expect(json).to include related_status: 'Reconciled'
			end
		end
	end

	describe '#investment_account' do
		subject(:transaction) { create :security_investment_transaction, investment_account: account }

		let(:account) { create :investment_account }

		it "should return the first account of type 'investment'" do
			expect(transaction.investment_account.account).to eq account
		end
	end

	describe '#cash_account' do
		subject(:transaction) { create :security_investment_transaction, cash_account: account }

		let(:account) { create :bank_account }

		it "should return the first account of type 'bank'" do
			expect(transaction.cash_account.account).to eq account
		end
	end
end
