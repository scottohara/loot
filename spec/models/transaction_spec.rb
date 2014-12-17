require 'rails_helper'
require 'models/concerns/transactable'
require 'models/concerns/categorisable'

RSpec.describe Transaction, :type => :model do
	matcher :match_json do |expected|
		match do |actual|
			actual.id.eql? expected[:id] and \
			actual.memo.eql? expected['memo'] and \
			(expected['flag'].nil? ? actual.flag : actual.flag.memo).eql? expected['flag']
		end
	end

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

	describe "::create_from_json" do
		let(:json) { {
			:id => 1,
			"memo" => "Test json"
		} }
		let(:flag) { "test flag" }

		context "unflagged" do
			it "should create a transaction from a JSON representation" do; end
		end

		context "flagged" do
			it "should create a transaction from a JSON representation" do
				json["flag"] = flag
			end
		end

		after :each do
			expect(Transaction.create_from_json(json)).to match_json json
		end
	end

	describe "#as_subclass" do
		subject { create(:transaction) }

		it "should become an instance matching the transaction type" do
			expect(subject.as_subclass.class).to be BasicTransaction
		end
	end

	describe "#update_from_json" do
		let(:json) { {
			:id => subject.id,
			"memo" => "Test json"
		} }
		let(:flag) { "test flag" }

		context "when initially unflagged" do
			subject { create :transaction }

			context "and the update does not include a flag" do
				it "should update a transaction from a JSON representation and remain unflagged" do; end
			end

			context "and the update includes a flag" do
				it "should update a transaction from a JSON representation and set the flag" do
					json["flag"] = flag
				end
			end
		end

		context "when initially flagged" do
			subject { create :transaction, :flagged }

			context "and the update does not include a flag" do
				it "should update a transaction from a JSON representation and clear the flag" do; end
			end

			context "and the update includes a flag" do
				it "should update a transaction from a JSON representation and remain flagged" do
					json["flag"] = flag
					expect(subject.flag).not_to receive(:destroy)
				end
			end
		end

		after :each do
			expect(subject.update_from_json(json)).to match_json json
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
