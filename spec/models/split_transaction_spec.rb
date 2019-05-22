# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'models/concerns/categorisable'

RSpec.describe SplitTransaction, type: :model do
	it_behaves_like Categorisable

	matcher :match_json do |expected, account, header|
		match do |actual|
			actual.transaction_type.eql?('Split') &&
				actual.id.eql?(expected[:id]) &&
				actual.amount.eql?(expected['amount']) &&
				actual.memo.eql?(expected['memo']) &&
				actual.transaction_account.direction.eql?(expected['direction']) &&
				actual.transaction_account.status.eql?(expected['status']) &&
				actual.account.eql?(account) &&
				actual.header.payee.eql?(header.payee) &&
				actual.header.transaction_date.eql?(header.transaction_date) &&
				actual.transaction_splits.size.eql?(expected['subtransactions'].size)
		end
	end

	describe '::create_from_json' do
		let(:account) { create :bank_account }
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
				'direction' => 'outflow',
				'transaction_date' => header.transaction_date,
				'status' => 'Cleared',
				'subtransactions' => []
			}
		end

		it 'should create a transaction from a JSON representation' do
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect_any_instance_of(PayeeTransactionHeader).to receive(:update_from_json).with(json).and_call_original
			expect_any_instance_of(SplitTransaction).to receive(:create_children).with json['subtransactions']
			expect(SplitTransaction.create_from_json json).to match_json json, account, header
		end
	end

	describe '::update_from_json' do
		let(:account) { create :bank_account }
		let(:transaction) { create :split_transaction, subtransactions: 1, subtransfers: 1 }
		let(:json) do
			{
				id: transaction.id,
				'amount' => 1,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => account.id
				},
				'direction' => 'outflow',
				'subtransactions' => []
			}
		end

		it 'should update a transaction from a JSON representation' do
			expect(SplitTransaction).to receive_message_chain(:includes, :find).with(json[:id]).and_return transaction
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect(transaction.header).to receive(:update_from_json).with json
			expect(SplitTransaction.update_from_json json).to match_json json, account, transaction.header
		end
	end

	describe '#create_children' do
		let(:subcategory) { create :subcategory }
		let(:account) { create :account }

		# Examples include keys that are both symbols and strings
		let(:children) do
			[
				{
					id: 'child 1',
					amount: 1,
					memo: 'Test subtransaction',
					transaction_type: 'Sub',
					flag: 'Test flag',
					category: {
						id: subcategory.parent.id
					},
					subcategory: {
						id: subcategory.id
					}
				},
				{
					'id' => 'child 2',
					'amount' => 1,
					'memo' => 'Test subtransfer',
					'transaction_type' => 'Subtransfer',
					'direction' => 'outflow',
					'account' => {
						'id' => account.id
					}
				}
			]
		end

		before :each do
			subject.create_children children
			subject.save!

			subtransaction = subject.subtransactions.first
			subtransfer = subject.subtransfers.first

			expect(subject.subtransactions.size).to eq 1
			expect(subtransaction.id).to_not eq children.first[:id]
			expect(subtransaction.amount).to eq children.first[:amount]
			expect(subtransaction.memo).to eq children.first[:memo]
			expect(subtransaction.transaction_type).to eq children.first[:transaction_type]
			expect(subtransaction.flag.memo).to eq children.first[:flag]
			expect(subtransaction.category).to eq subcategory

			expect(subject.subtransfers.size).to eq 1
			expect(subtransfer.id).to_not eq children.last['id']
			expect(subtransfer.header.payee).to eq subject.header.payee
			expect(subtransfer.amount).to eq children.last['amount']
			expect(subtransfer.memo).to eq children.last['memo']
			expect(subtransfer.transaction_type).to eq children.last['transaction_type']
			expect(subtransfer.transaction_account.direction).to eq 'inflow'
			expect(subtransfer.account).to eq account
		end

		context 'unscheduled' do
			subject { create :split_transaction }

			it 'should build child transactions of the appropriate types' do
				expect(subject.subtransfers.first.header.transaction_date).to eq subject.header.transaction_date
				expect(subject.subtransfers.first.header.schedule).to be_nil
			end
		end

		context 'scheduled' do
			subject { create :split_transaction, :scheduled }

			it 'should build child transactions of the appropriate types' do
				expect(subject.subtransfers.first.header.transaction_date).to be_nil
				expect(subject.subtransfers.first.header.schedule.next_due_date).to eq subject.header.schedule.next_due_date
				expect(subject.subtransfers.first.header.schedule.frequency).to eq subject.header.schedule.frequency
			end
		end
	end

	describe '#as_json' do
		let(:json) { subject.as_json }

		before :each do
			expect(subject.account).to receive(:as_json).and_return 'account json'
		end

		context 'outflow' do
			subject { create :split_to_transaction, status: 'Reconciled' }

			it 'should return a JSON representation' do
				expect(json).to include category: {id: 'SplitTo', name: 'Split To'}
				expect(json).to include direction: 'outflow'
			end
		end

		context 'inflow' do
			subject { create :split_from_transaction, status: 'Reconciled' }

			it 'should return a JSON representation' do
				expect(json).to include category: {id: 'SplitFrom', name: 'Split From'}
				expect(json).to include direction: 'inflow'
			end
		end

		after :each do
			expect(json).to include primary_account: 'account json'
			expect(json).to include status: 'Reconciled'
		end
	end

	describe '#children' do
		matcher :match_json do |expected, direction|
			match do |actual|
				actual.all? do |actual_trx|
					expected_trx = expected.find { |t| t[:id].eql? actual_trx[:id] }
					return false if expected_trx.nil?

					actual_trx[:id].eql?(expected_trx[:id]) &&
						actual_trx[:transaction_type].eql?(expected_trx[:transaction_type]) &&
						actual_trx[:category][:id].eql?(expected_trx[:category] && expected_trx[:category][:id].to_s) &&
						actual_trx[:category][:name].eql?(expected_trx[:category] && expected_trx[:category][:name]) &&
						(actual_trx[:subcategory] && actual_trx[:subcategory][:id]).eql?(expected_trx[:subcategory] && expected_trx[:subcategory][:id].to_s) &&
						(actual_trx[:subcategory] && actual_trx[:subcategory][:name]).eql?(expected_trx[:subcategory] && expected_trx[:subcategory][:name]) &&
						actual_trx[:account][:id].eql?(expected_trx[:transaction_type].eql?('Subtransfer') && expected_trx[:primary_account][:id] || nil) &&
						actual_trx[:account][:name].eql?(expected_trx[:transaction_type].eql?('Subtransfer') && expected_trx[:primary_account][:name] || nil) &&
						actual_trx[:amount].eql?(expected_trx[:amount]) &&
						actual_trx[:direction].eql?(expected_trx[:transaction_type].eql?('Subtransfer') && direction || expected_trx[:category][:direction]) &&
						actual_trx[:memo].eql?(expected_trx[:memo]) &&
						actual_trx[:flag].eql?(expected_trx[:flag])
				end
			end
		end

		context 'split transaction' do
			subject { create :split_transaction }
			let!(:expected_children) do
				[
					create(:sub_expense_transaction, :flagged, parent: subject).as_json,
					create(:subtransfer_to_transaction, parent: subject).as_json,
					create(:sub_income_transaction, parent: subject).as_json,
					create(:subtransfer_from_transaction, parent: subject).as_json,
					create(:sub_transaction, parent: subject, category: create(:subcategory)).as_json
				]
			end

			it 'should return a JSON representation of all child transactions' do
				expect(subject.children).to match_json expected_children, subject.transaction_account.direction # Should the children always match the parent direction?
			end
		end

		context 'payslip transaction' do
			subject { create :payslip_transaction, subtransfers: 1 }

			it "should set any subtransfer directions to 'outflow'" do
				expect(subject.children.first[:direction]).to eq 'outflow'
			end
		end
	end
end
