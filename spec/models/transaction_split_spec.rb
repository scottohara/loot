# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TransactionSplit, type: :model do
	describe '#validate_transaction_type_inclusion' do
		subject(:split) { described_class.new }

		let(:error_message) { "Transaction type #{split.trx.transaction_type} is not valid in a split transaction" }

		it "should not be an error if the transaction type is 'Sub'" do
			split.trx = build :sub_transaction
			split.validate_transaction_type_inclusion
			expect(split.errors[:base]).not_to include error_message
		end

		it "should not be an error if the transaction type is 'Subtransfer'" do
			split.trx = build :subtransfer_transaction
			split.validate_transaction_type_inclusion
			expect(split.errors[:base]).not_to include error_message
		end

		it "should be an error if the transaction type is neither 'Sub' nor 'Subtransfer'" do
			split.trx = build :basic_transaction
			split.validate_transaction_type_inclusion
			expect(split.errors[:base]).to include error_message
		end
	end

	describe '#destroy_transaction' do
		subject(:split) { parent.transaction_splits.first }

		let(:parent) { create :split_transaction, subtransactions: 1 }

		it 'should destroy the transaction' do
			split.destroy_transaction
			expect(Transaction.exists? split.transaction_id).to be false
		end
	end
end
