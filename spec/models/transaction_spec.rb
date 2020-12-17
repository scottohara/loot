# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'models/concerns/transactable'
require 'models/concerns/categorisable'

::RSpec.describe ::Transaction, type: :model do
	matcher :match_json do |expected|
		match do |actual|
			actual.id.eql?(expected[:id]) &&
				actual.memo.eql?(expected['memo']) &&
				(expected['flag'].nil? ? actual.flag : actual.flag.memo).eql?(expected['flag'])
		end
	end

	it_behaves_like ::Categorisable

	it_behaves_like ::Transactable do
		let(:as_class_method) { true }
		let(:context_factory) { :bank_account }
		let(:ledger_json_key) { :memo }
		let(:expected_closing_balances) { {with_date: -1, without_date: 1} }
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
		let(:flag) { 'test flag' }

		after do
			expect(described_class.create_from_json json).to match_json json
		end

		context 'unflagged' do
			it('should create a transaction from a JSON representation') {} # Empty block
		end

		context 'flagged' do
			it 'should create a transaction from a JSON representation' do
				json['flag'] = flag
			end
		end
	end

	describe '#as_subclass' do
		subject(:transaction) { create :transaction }

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
		let(:flag) { 'test flag' }

		after do
			expect(transaction.update_from_json json).to match_json json
		end

		context 'when initially unflagged' do
			subject(:transaction) { create :transaction }

			context 'and the update does not include a flag' do
				it('should update a transaction from a JSON representation and remain unflagged') {} # Empty block
			end

			context 'and the update includes a flag' do
				it 'should update a transaction from a JSON representation and set the flag' do
					json['flag'] = flag
				end
			end
		end

		context 'when initially flagged' do
			subject(:transaction) { create :transaction, :flagged }

			context 'and the update does not include a flag' do
				it('should update a transaction from a JSON representation and clear the flag') {} # Empty block
			end

			context 'and the update includes a flag' do
				it 'should update a transaction from a JSON representation and remain flagged' do
					json['flag'] = flag
					expect(transaction.flag).not_to receive :destroy
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
			subject(:transaction) { create :basic_transaction }

			it 'should return a JSON representation' do
				expect(json).to include flag: nil
			end
		end

		context 'flagged' do
			subject(:transaction) { create :basic_transaction, :flagged }

			it 'should return a JSON representation' do
				expect(json).to include flag: 'Transaction flag'
			end
		end
	end
end
