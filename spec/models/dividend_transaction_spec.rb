# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DividendTransaction, type: :model do
	matcher :match_json do |expected, investment_account, cash_account, header|
		match do |actual|
			actual.transaction_type.eql?('Dividend') &&
				actual.id.eql?(expected[:id]) &&
				actual.amount.eql?(expected['amount']) &&
				actual.memo.eql?(expected['memo']) &&
				actual.investment_account.direction.eql?('outflow') &&
				actual.investment_account.status.eql?(expected['status']) &&
				actual.investment_account.account.eql?(investment_account) &&
				actual.cash_account.direction.eql?('inflow') &&
				actual.cash_account.status.eql?(expected['related_status']) &&
				actual.cash_account.account.eql?(cash_account) &&
				actual.header.security.eql?(header.security) &&
				actual.header.transaction_date.eql?(header.transaction_date) &&
				actual.header.quantity.nil? &&
				actual.header.price.nil? &&
				actual.header.commission.nil?
		end
	end

	describe '::create_from_json' do
		let(:investment_account) { create :investment_account }
		let(:cash_account) { create :bank_account }
		let(:header) { create :security_transaction_header }
		let(:json) do
			{
				id: 1,
				'amount' => 1,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => investment_account.id
				},
				'account' => {
					'id' => cash_account.id
				},
				'security' => {
					'id' => header.security.id
				},
				'transaction_date' => header.transaction_date,
				'status' => 'Cleared',
				'related_status' => 'Reconciled',
				'quantity' => 1,
				'price' => 2,
				'commission' => 3
			}
		end

		before do
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return investment_account
			expect(Account).to receive(:find).with(json['account']['id']).and_return cash_account
			expect_any_instance_of(SecurityTransactionHeader).to receive(:update_from_json).with(json).and_call_original
			expect_any_instance_of(SecurityTransaction).to receive(:validate_absence).with 'quantity'
			expect_any_instance_of(SecurityTransaction).to receive(:validate_absence).with 'price'
			expect_any_instance_of(SecurityTransaction).to receive(:validate_absence).with 'commission'
		end

		it 'should create a transaction from a JSON representation' do
			expect(described_class.create_from_json json).to match_json json, investment_account, cash_account, header
		end
	end

	describe '::update_from_json' do
		let(:investment_account) { create :investment_account }
		let(:cash_account) { create :bank_account }
		let(:transaction) { create :dividend_transaction }
		let(:json) do
			{
				id: transaction.id,
				'amount' => 1,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => investment_account.id
				},
				'account' => {
					'id' => cash_account.id
				}
			}
		end

		before do
			expect(described_class).to receive_message_chain(:includes, :find).with(json[:id]).and_return transaction
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return investment_account
			expect(Account).to receive(:find).with(json['account']['id']).and_return cash_account
			expect(transaction.header).to receive(:update_from_json).with json
		end

		it 'should update a transaction from a JSON representation' do
			expect(described_class.update_from_json json).to match_json json, investment_account, cash_account, transaction.header
		end
	end

	describe '#as_json' do
		subject(:transaction) { create :dividend_transaction, status: 'Reconciled' }

		before do
			expect(transaction.investment_account.account).to receive(:as_json).and_return 'investment account json'
			expect(transaction.cash_account.account).to receive(:as_json).and_return 'cash account json'
		end

		after do
			expect(json).to include amount: 1
			expect(json).to include status: 'Reconciled'
		end

		context 'for investment account' do
			let(:json) { transaction.as_json }

			it 'should return a JSON representation' do
				expect(json).to include primary_account: 'investment account json'
				expect(json).to include category: {id: 'DividendTo', name: 'Dividend To'}
				expect(json).to include account: 'cash account json'
				expect(json).to include direction: 'outflow'
			end
		end

		context 'for cash account' do
			let(:json) { transaction.as_json primary_account: transaction.cash_account.account_id }

			it 'should return a JSON representation' do
				expect(json).to include primary_account: 'cash account json'
				expect(json).to include category: {id: 'DividendFrom', name: 'Dividend From'}
				expect(json).to include account: 'investment account json'
				expect(json).to include direction: 'inflow'
			end
		end
	end

	describe '#investment_account' do
		subject(:transaction) { create :dividend_transaction, investment_account: account }

		let(:account) { create :investment_account }

		it "should return the first account of type 'investment'" do
			expect(transaction.investment_account.account).to eq account
		end
	end

	describe '#cash_account' do
		subject(:transaction) { create :dividend_transaction, cash_account: account }

		let(:account) { create :bank_account }

		it "should return the first account of type 'bank'" do
			expect(transaction.cash_account.account).to eq account
		end
	end
end
