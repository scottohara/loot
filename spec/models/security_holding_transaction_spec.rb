# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SecurityHoldingTransaction, type: :model do
	matcher :match_json do |expected, account, header|
		match do |actual|
			actual.transaction_type.eql?('SecurityHolding') &&
				actual.id.eql?(expected[:id]) &&
				actual.memo.eql?(expected['memo']) &&
				actual.transaction_account.direction.eql?(expected['direction']) &&
				actual.transaction_account.status.eql?(expected['status']) &&
				actual.account.eql?(account) &&
				actual.header.security.eql?(header.security) &&
				actual.header.transaction_date.eql?(header.transaction_date) &&
				actual.header.price.nil? &&
				actual.header.commission.nil?
		end
	end

	describe '::create_from_json' do
		let(:account) { create :investment_account }
		let(:header) { create :security_transaction_header }
		let(:json) do
			{
				id: 1,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => account.id
				},
				'security' => {
					'id' => header.security.id
				},
				'transaction_date' => header.transaction_date,
				'status' => 'Cleared',
				'price' => 1,
				'commission' => 2
			}
		end

		before :each do
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect_any_instance_of(SecurityTransactionHeader).to receive(:update_from_json).with(json).and_call_original
			expect_any_instance_of(SecurityTransaction).to receive(:validate_presence).with 'quantity'
			expect_any_instance_of(SecurityTransaction).to receive(:validate_absence).with 'price'
			expect_any_instance_of(SecurityTransaction).to receive(:validate_absence).with 'commission'
		end

		context 'add shares' do
			it 'should create a transaction from a JSON representation' do
				json['direction'] = 'inflow'
			end
		end

		context 'remove shares' do
			it 'should create a transaction from a JSON representation' do
				json['direction'] = 'outflow'
			end
		end

		after :each do
			expect(SecurityHoldingTransaction.create_from_json json).to match_json json, account, header
		end
	end

	describe '::update_from_json' do
		let(:account) { create :investment_account }
		let(:transaction) { create :security_holding_transaction }
		let(:json) do
			{
				id: transaction.id,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => account.id
				}
			}
		end

		before :each do
			expect(SecurityHoldingTransaction).to receive_message_chain(:includes, :find).with(json[:id]).and_return transaction
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect(transaction.header).to receive(:update_from_json).with json
		end

		context 'add shares' do
			it 'should update a transaction from a JSON representation' do
				json['direction'] = 'inflow'
			end
		end

		context 'with subcategory' do
			it 'should update a transaction from a JSON representation' do
				json['direction'] = 'outflow'
			end
		end

		after :each do
			expect(SecurityHoldingTransaction.update_from_json json).to match_json json, account, transaction.header
		end
	end

	describe '#as_json' do
		let(:json) { subject.as_json }

		before :each do
			expect(subject.account).to receive(:as_json).and_return 'account json'
		end

		context 'add shares' do
			subject { create :security_add_transaction, status: 'Reconciled' }

			it 'should return a JSON representation' do
				expect(json).to include category: {id: 'AddShares', name: 'Add Shares'}
				expect(json).to include direction: 'inflow'
			end
		end

		context 'remove shares' do
			subject { create :security_remove_transaction, status: 'Reconciled' }

			it 'should return a JSON representation' do
				expect(json).to include category: {id: 'RemoveShares', name: 'Remove Shares'}
				expect(json).to include direction: 'outflow'
			end
		end

		after :each do
			expect(json).to include primary_account: 'account json'
			expect(json).to include status: 'Reconciled'
			expect(json).to include quantity: 10
		end
	end
end
