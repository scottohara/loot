require 'rails_helper'

RSpec.describe SecurityHoldingTransaction, :type => :model do
	matcher :match_json do |expected, account|
		match do |actual|
			actual.transaction_type.eql? "SecurityHolding" and \
			actual.id.eql? expected[:id] and \
			actual.memo.eql? expected['memo'] and \
			actual.transaction_account.direction.eql? expected['direction'] and \
			actual.transaction_account.status.eql? expected['status'] and \
			actual.account.eql? account
		end
	end

	describe "::create_from_json" do
		let(:account) { create :investment_account }
		let(:json) { {
			:id => 1,
			"memo" => "Test json",
			"primary_account" => {
				"id" => account.id
			},
			"status" => "Cleared"
		} }

		before :each do
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect_any_instance_of(SecurityTransactionHeader).to receive(:update_from_json).with(json)
			expect_any_instance_of(SecurityTransaction).to receive(:validate_presence).with("quantity")
		end

		context "add shares" do
			it "should create a transaction from a JSON representation" do
				json["direction"] = "inflow"
			end
		end

		context "remove shares" do
			it "should create a transaction from a JSON representation" do
				json["direction"] = "outflow"
			end
		end

		after :each do
			expect(SecurityHoldingTransaction.create_from_json(json)).to match_json json, account
		end
	end

	describe "::update_from_json" do
		let(:account) { create :investment_account }
		let(:transaction) { create :security_holding_transaction }
		let(:json) { {
			:id => transaction.id,
			"memo" => "Test json",
			"primary_account" => {
				"id" => account.id
			}
		} }

		before :each do
			expect(SecurityHoldingTransaction).to receive_message_chain(:includes, :find).with(json[:id]).and_return transaction
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect(transaction.header).to receive(:update_from_json).with(json)
		end

		context "add shares" do
			it "should update a transaction from a JSON representation" do
				json["direction"] = "inflow"
			end
		end

		context "with subcategory" do
			it "should update a transaction from a JSON representation" do
				json["direction"] = "outflow"
			end
		end

		after :each do
			expect(SecurityHoldingTransaction.update_from_json(json)).to match_json json, account
		end
	end

	describe "#as_json" do
		let(:json) { subject.as_json }

		before :each do
			expect(subject.account).to receive(:as_json).and_return("account json")
		end

		context "add shares" do
			subject { create(:security_add_transaction, status: "Reconciled") }

			it "should return a JSON representation" do
				expect(json).to include(:category => {:id => "AddShares", :name => "Add Shares"})
				expect(json).to include(:direction => "inflow")
			end
		end

		context "remove shares" do
			subject { create(:security_remove_transaction, status: "Reconciled") }

			it "should return a JSON representation" do
				expect(json).to include(:category => {:id => "RemoveShares", :name => "Remove Shares"})
				expect(json).to include(:direction => "outflow")
			end
		end

		after :each do
			expect(json).to include(:primary_account => "account json")
			expect(json).to include(:status => "Reconciled")
			expect(json).to include(:quantity => 10)
		end
	end
end
