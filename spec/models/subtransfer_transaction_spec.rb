require 'rails_helper'

RSpec.describe SubtransferTransaction, type: :model do
	matcher :match_json do |expected, direction, account|
		match do |actual|
			actual.transaction_type.eql? "Subtransfer" and \
			actual.amount.eql? expected['amount'] and \
			actual.memo.eql? expected['memo'] and \
			actual.transaction_account.direction.eql? direction and \
			actual.transaction_account.status.eql? expected['status'] and \
			actual.transaction_account.account.eql? account
		end
	end

	describe "::create_from_json" do
		let(:account) { create :bank_account }
		let(:json) { {
			"amount" => 1,
			"memo" => "Test json",
			"account" => {
				"id" => account.id
			},
			"status" => "Cleared"
		} }

		before :each do
			expect(Account).to receive(:find).with(json['account']['id']).and_return account
			expect_any_instance_of(PayeeTransactionHeader).to receive(:update_from_json).with json
		end

		context "outflow" do
			let(:direction) { "inflow" }

			it "should create a transaction from a JSON representation" do
				json["direction"] = "outflow"
			end
		end

		context "inflow" do
			let(:direction) { "outflow" }

			it "should create a transaction from a JSON representation" do
				json["direction"] = "inflow"
			end
		end

		after :each do
			expect(SubtransferTransaction.create_from_json(json)).to match_json json, direction, account
		end
	end

	describe "::update_from_json" do
	end

	describe "#as_json" do

		before :each do
			expect(subject.account).to receive(:as_json).and_return("account json")
			expect(subject.parent.account).to receive(:as_json).and_return("parent account json")
		end

		context "outflow" do
			subject { create(:subtransfer_to_transaction, status: "Reconciled") }
			let(:json) { subject.as_json({direction: "outflow"}) }

			it "should return a JSON representation" do
				expect(json).to include(category: {id: "TransferTo", name: "Transfer To"})
				expect(json).to include(direction: "outflow")
			end
		end

		context "inflow" do
			subject { create(:subtransfer_from_transaction, status: "Reconciled") }
			let(:json) { subject.as_json({direction: "inflow"}) }

			it "should return a JSON representation" do
				expect(json).to include(category: {id: "TransferFrom", name: "Transfer From"})
				expect(json).to include(direction: "inflow")
			end
		end

		after :each do
			expect(json).to include(primary_account: "account json")
			expect(json).to include(account: "parent account json")
			expect(json).to include(status: "Reconciled")
			expect(json).to include(related_status: nil)
			expect(json).to include(parent_id: subject.parent.id)
		end
	end
end
