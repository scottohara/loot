require 'rails_helper'
require 'models/concerns/transactable'
require 'models/concerns/categorisable'

RSpec.describe Transaction, :type => :model do
	it_behaves_like Categorisable

	it_behaves_like Transactable do
		let(:as_class_method) { true }
		let(:context_factory) { :bank_account }
		let(:ledger_json_key) { :memo }
		let(:expected_closing_balances) { {:with_date => -1, :without_date => 1 } }
	end

	describe "::class_for" do
		subject { described_class }
		
		it "should return the transaction class for a given type" do
			expect(subject.class_for("Basic")).to be BasicTransaction
		end
	end

	describe "::types_for" do
		subject { described_class }

		context "non-investment accounts" do
			it "should return the set of non-investment transactions" do
				expect(subject.types_for("bank")).to eq %w(Basic Split Transfer Payslip LoanRepayment)
			end
		end

		context "investment accounts" do
			it "should return the set of investment transactions" do
				expect(subject.types_for("investment")).to eq %w(SecurityTransfer SecurityHolding SecurityInvestment Dividend)
			end
		end
	end

	describe "::transactions" do
		subject { described_class }

		it "should return self" do
			expect(subject.transactions).to eql subject
		end
	end

	describe "::opening_balance" do
		subject { described_class }

		it "should return zero" do
			expect(subject.opening_balance).to eq 0
		end
	end

	describe "::account_type" do
		subject { described_class }
		
		it "should return nil" do
			expect(subject.account_type).to be_nil
		end
	end

	describe "#as_subclass" do
		subject { create(:transaction) }

		it "should become an instance matching the transaction type" do
			expect(subject.as_subclass.class).to be BasicTransaction
		end
	end

	describe "#as_json" do
		let(:json) { subject.as_json }

		context "unflagged" do
			subject { create(:basic_transaction) }

			it "should return a JSON representation" do
				expect(json).to include(:flag => nil)
			end
		end

		context "flagged" do
			subject { create(:basic_transaction, :flagged) }

			it "should return a JSON representation" do
				expect(json).to include(:flag => "Transaction flag")
			end
		end

		after :each do
			expect(json).to include(:id => subject.id)
			expect(json).to include(:transaction_type => "Basic")
			expect(json).to include(:memo => "Basic transaction")
		end
	end
end
