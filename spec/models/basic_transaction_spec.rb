# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BasicTransaction, type: :model do
	matcher :match_json do |expected, account, category, header|
		match do |actual|
			actual.transaction_type.eql?('Basic') &&
				actual.id.eql?(expected[:id]) &&
				actual.amount.eql?(expected['amount']) &&
				actual.memo.eql?(expected['memo']) &&
				actual.transaction_account.direction.eql?(category.direction) &&
				actual.transaction_account.status.eql?(expected['status']) &&
				actual.account.eql?(account) &&
				actual.header.payee.eql?(header.payee) &&
				actual.header.transaction_date.eql?(header.transaction_date) &&
				actual.category.eql?(category)
		end
	end

	describe '::create_from_json' do
		let(:account) { create :bank_account }
		let(:category) { create :category }
		let(:subcategory) { create :subcategory, parent: category }
		let(:header) { create :payee_transaction_header }
		let(:json) do
			{
				id: 1,
				'amount' => 1,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => account.id
				},
				'payee' => {
					'id' => header.payee.id
				},
				'category' => {
					'id' => category.id
				},
				'transaction_date' => header.transaction_date,
				'status' => 'Cleared'
			}
		end

		before :each do
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect(Category).to receive(:find_or_new).with(json['category']).and_return category
			expect_any_instance_of(PayeeTransactionHeader).to receive(:update_from_json).with(json).and_call_original
		end

		context 'with category' do
			it 'should create a transaction from a JSON representation' do
				expect(BasicTransaction.create_from_json json).to match_json json, account, category, header
			end
		end

		context 'with subcategory' do
			it 'should create a transaction from a JSON representation' do
				json['subcategory'] = {'id' => subcategory.id}
				expect(Category).to receive(:find_or_new).with(json['subcategory'], category).and_return subcategory
				expect(BasicTransaction.create_from_json json).to match_json json, account, subcategory, header
			end
		end
	end

	describe '::update_from_json' do
		let(:account) { create :bank_account }
		let(:category) { create :category }
		let(:subcategory) { create :subcategory, parent: category }
		let(:transaction) { create :basic_transaction }
		let(:json) do
			{
				id: transaction.id,
				'amount' => 1,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => account.id
				},
				'category' => {
					'id' => category.id
				}
			}
		end

		before :each do
			expect(BasicTransaction).to receive_message_chain(:includes, :find).with(json[:id]).and_return transaction
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect(Category).to receive(:find_or_new).with(json['category']).and_return category
			expect(transaction.header).to receive(:update_from_json).with json
		end

		context 'with category' do
			it 'should update a transaction from a JSON representation' do
				expect(BasicTransaction.update_from_json json).to match_json json, account, category, transaction.header
			end
		end

		context 'with subcategory' do
			it 'should update a transaction from a JSON representation' do
				json['subcategory'] = {'id' => subcategory.id}
				expect(Category).to receive(:find_or_new).with(json['subcategory'], category).and_return subcategory
				expect(BasicTransaction.update_from_json json).to match_json json, account, subcategory, transaction.header
			end
		end
	end

	describe '#as_json' do
		let(:json) { subject.as_json }

		before :each do
			expect(subject.account).to receive(:as_json).and_return 'account json'
		end

		context 'with category' do
			subject { create :basic_transaction, status: 'Reconciled' }

			before :each do
				expect(subject.category).to receive(:as_json).and_return 'category json'
			end

			it 'should return a JSON representation' do
				expect(json).to include category: 'category json'
				expect(json).to include subcategory: nil
			end
		end

		context 'with subcategory' do
			subject { create :basic_transaction, category: FactoryBot.create(:subcategory), status: 'Reconciled' }

			before :each do
				expect(subject.category.parent).to receive(:as_json).and_return 'category json'
				expect(subject.category).to receive(:as_json).and_return 'subcategory json'
			end

			it 'should return a JSON representation' do
				expect(json).to include category: 'category json'
				expect(json).to include subcategory: 'subcategory json'
			end
		end

		after :each do
			expect(json).to include primary_account: 'account json'
			expect(json).to include direction: 'outflow'
			expect(json).to include status: 'Reconciled'
		end
	end
end
