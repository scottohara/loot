# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'models/concerns/categorisable'
require 'models/concerns/transactable'
require 'rails_helper'

::RSpec.describe ::Transaction do
	matcher :match_json do |expected|
		match do |actual|
			actual.id.eql?(expected[:id]) &&
				actual.memo.eql?(expected['memo']) &&
				(actual.flag ? (actual.flag.flag_type.eql?(expected['flag_type']) && actual.flag.memo.eql?(expected['flag'])) : expected['flag_type'].nil? && expected['flag'].nil?)
		end
	end

	it_behaves_like ::Categorisable

	context 'search by memo' do
		it_behaves_like ::Transactable do
			let(:as_class_method) { true }
			let(:context_factory) { :bank_account }
			let(:ledger_json_key) { :memo }
			let(:expected_closing_balances) { {with_date: -1, without_date: 1} }
			let(:search_term) { 'transaction' }
		end
	end

	context 'search by is:flagged' do
		it_behaves_like ::Transactable do
			let(:as_class_method) { true }
			let(:context_factory) { :bank_account }
			let(:ledger_json_key) { :flag }
			let(:expected_closing_balances) { {with_date: -1, without_date: -1} }
			let(:search_term) { 'is:flagged' }
		end
	end

	describe '::class_for' do
		subject(:transaction) { described_class }

		it 'should return the transaction class for a given type' do
			expect(transaction.class_for 'Basic').to be ::BasicTransaction
		end
	end

	describe '::types_for' do
		subject(:transaction) { described_class }

		context 'non-investment accounts' do
			it 'should return the set of non-investment transactions' do
				expect(transaction.types_for 'bank').to eq %w[Basic Split Transfer Payslip LoanRepayment]
			end
		end

		context 'investment accounts' do
			it 'should return the set of investment transactions' do
				expect(transaction.types_for 'investment').to eq %w[SecurityTransfer SecurityHolding SecurityInvestment Dividend]
			end
		end
	end

	describe '::transactions' do
		subject(:transaction) { described_class }

		it 'should return self' do
			expect(transaction.transactions).to eql transaction
		end
	end

	describe '::opening_balance' do
		subject(:transaction) { described_class }

		it 'should return zero' do
			expect(transaction.opening_balance).to eq 0
		end
	end

	describe '::account_type' do
		subject(:transaction) { described_class }

		it 'should return nil' do
			expect(transaction.account_type).to be_nil
		end
	end

	describe '::create_from_json' do
		let(:json) do
			{
				id: 1,
				'memo' => 'Test json'
			}
		end
		let(:flag_type) { 'noreceipt' }
		let(:flag) { 'test flag' }

		after do
			expect(described_class.create_from_json json).to match_json json
		end

		context 'unflagged' do
			it('should create a transaction from a JSON representation') {} # Empty block
		end

		context 'flagged' do
			context 'with type only' do
				it 'should create a transaction from a JSON representation' do
					json['flag_type'] = flag_type
				end
			end

			context 'with type and memo' do
				it 'should create a transaction from a JSON representation' do
					json['flag_type'] = flag_type
					json['flag'] = flag
				end
			end
		end
	end

	describe '#as_subclass' do
		subject(:transaction) { create(:transaction) }

		it 'should become an instance matching the transaction type' do
			expect(transaction.as_subclass.class).to be ::BasicTransaction
		end
	end

	describe '#update_from_json' do
		let(:json) do
			{
				id: transaction.id,
				'memo' => 'Test json'
			}
		end
		let(:flag_type) { 'noreceipt' }
		let(:flag) { 'test flag' }

		after do
			expect(transaction.update_from_json json).to match_json json
		end

		context 'when initially unflagged' do
			subject(:transaction) { create(:transaction) }

			context 'and the update does not include a flag' do
				it('should update a transaction from a JSON representation and remain unflagged') {} # Empty block
			end

			context 'and the update includes a flag with type only' do
				it 'should update a transaction from a JSON representation and set the flag' do
					json['flag_type'] = flag_type
				end
			end

			context 'and the update includes a flag with type and memo' do
				it 'should update a transaction from a JSON representation and set the flag' do
					json['flag_type'] = flag_type
					json['flag'] = flag
				end
			end
		end

		context 'when initially flagged' do
			subject(:transaction) { create(:transaction, :flagged) }

			context 'and the update does not include a flag' do
				it('should update a transaction from a JSON representation and clear the flag') {} # Empty block
			end

			context 'and the update includes a flag' do
				after do
					expect(transaction.flag).not_to receive :destroy
				end

				context 'with type only' do
					it 'should update a transaction from a JSON representation and remain flagged' do
						json['flag_type'] = flag_type
					end
				end

				context 'with type and memo' do
					it 'should update a transaction from a JSON representation and remain flagged' do
						json['flag_type'] = flag_type
						json['flag'] = flag
					end
				end
			end
		end
	end

	describe '#as_json' do
		let(:json) { transaction.as_json }

		after do
			expect(json).to include id: transaction.id
			expect(json).to include transaction_type: 'Basic'
			expect(json).to include memo: 'Basic transaction'
		end

		context 'unflagged' do
			subject(:transaction) { create(:basic_transaction) }

			it 'should return a JSON representation' do
				expect(json).to include flag_type: nil
				expect(json).to include flag: nil
			end
		end

		context 'flagged' do
			subject(:transaction) { create(:basic_transaction, :flagged) }

			it 'should return a JSON representation' do
				expect(json).to include flag_type: 'noreceipt'
				expect(json).to include flag: 'Transaction flag'
			end
		end
	end
end
