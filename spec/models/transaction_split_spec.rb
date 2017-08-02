# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TransactionSplit, type: :model do
	describe '#validate_transaction_type_inclusion' do
		subject { TransactionSplit.new }
		let(:error_message) { "Transaction type #{subject.trx.transaction_type} is not valid in a split transaction" }

		it "should not be an error if the transaction type is 'Sub'" do
			subject.trx = build :sub_transaction
			subject.validate_transaction_type_inclusion
			expect(subject.errors[:base]).to_not include error_message
		end

		it "should not be an error if the transaction type is 'Subtransfer'" do
			subject.trx = build :subtransfer_transaction
			subject.validate_transaction_type_inclusion
			expect(subject.errors[:base]).to_not include error_message
		end

		it "should be an error if the transaction type is neither 'Sub' nor 'Subtransfer'" do
			subject.trx = build :basic_transaction
			subject.validate_transaction_type_inclusion
			expect(subject.errors[:base]).to include error_message
		end
	end

	describe '#destroy_transaction' do
		let(:parent) { create :split_transaction, subtransactions: 1 }
		subject { parent.transaction_splits.first }

		it 'should destroy the transaction' do
			subject.destroy_transaction
			expect(Transaction.exists? subject.transaction_id).to be false
		end
	end
end
