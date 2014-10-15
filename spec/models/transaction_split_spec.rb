require 'rails_helper'

RSpec.describe TransactionSplit, :type => :model do
	describe "#validate_transaction_type_inclusion" do
		subject { TransactionSplit.new }
		let(:error_message) { "Transaction type #{subject.trx.transaction_type} is not valid in a split transaction" }

		it "should not be an error if the transaction type is 'Sub'" do
			subject.trx = build :sub_transaction
			subject.validate_transaction_type_inclusion
			expect(subject.errors[:base]).to_not include(error_message)
		end

		it "should not be an error if the transaction type is 'Subtransfer'" do
			subject.trx = build :subtransfer_transaction
			subject.validate_transaction_type_inclusion
			expect(subject.errors[:base]).to_not include(error_message)
		end

		it "should be an error if the transaction type is neither 'Sub' nor 'Subtransfer'" do
			subject.trx = build :basic_transaction
			subject.validate_transaction_type_inclusion
			expect(subject.errors[:base]).to include(error_message)
		end
	end

	describe "#build_trx" do
		let(:parent) { create :split_transaction }
		subject { parent.transaction_splits.build }

		it "should raise an error if the transaction type is not set" do
			expect { subject.build_trx }.to raise_error "Transaction type must be set first"
		end

		let(:attributes) { {:amount => 1, :memo => "Test transaction", :transaction_type => transaction_type} }
		let(:trx) { subject.build_trx attributes }

		context "for a subtransaction", :valid => true do
			let(:transaction_type) { "Sub" }

			it "should build a subtransaction" do; end
		end

		context "for a subtransfer" do
			let(:transaction_type) { "Subtransfer" }

			it "should raise an error if the parent transaction header is not set" do
				parent.header = nil
				expect { trx }.to raise_error "Parent transaction header must be set first"
			end

			it "should build a subtransfer", :valid => true do
				expect(trx.header).to have_attributes :transaction_date => parent.header.transaction_date, :payee => parent.header.payee
			end
		end

		after :each, :valid do
			expect(trx).to have_attributes attributes
		end
	end

	describe "#destroy_transaction" do
		let(:parent) { create :split_transaction, subtransactions: 1 }
		subject { parent.transaction_splits.first }

		it "should destroy the transaction" do
			subject.destroy_transaction
			expect(Transaction.exists? subject.transaction_id).to be false
		end
	end
end
