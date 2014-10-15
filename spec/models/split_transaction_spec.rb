require 'rails_helper'
require 'models/concerns/categorisable'

RSpec.describe SplitTransaction, :type => :model do
	it_behaves_like Categorisable

	matcher :match_json do |expected, account|
		match do |actual|
			actual.transaction_type.eql? "Split" and \
			actual.id.eql? expected[:id] and \
			actual.amount.eql? expected['amount'] and \
			actual.memo.eql? expected['memo'] and \
			actual.transaction_account.direction.eql? expected['direction'] and \
			actual.account.eql? account and \
			actual.transaction_splits.size.eql? expected['subtransactions'].size
		end
	end

	describe "::create_from_json" do
		let(:account) { create :bank_account }
		let(:json) { {
			:id => 1,
			"amount" => 1,
			"memo" => "Test json",
			"primary_account" => {
				"id" => account.id
			},
			"direction" => "outflow",
			"subtransactions" => []
		} }

		it "should create a transaction from a JSON representation" do
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect_any_instance_of(PayeeTransactionHeader).to receive(:update_from_json).with json
			expect_any_instance_of(SplitTransaction).to receive(:create_children).with json["subtransactions"]
			expect(SplitTransaction.create_from_json(json)).to match_json json, account
		end
	end

	describe "::update_from_json" do
		let(:account) { create :bank_account }
		let(:transaction) { create :split_transaction, subtransactions: 1, subtransfers: 1 }
		let(:json) { {
			:id => transaction.id,
			"amount" => 1,
			"memo" => "Test json",
			"primary_account" => {
				"id" => account.id
			},
			"direction" => "outflow",
			"subtransactions" => []
		} }

		it "should update a transaction from a JSON representation" do
			expect(SplitTransaction).to receive_message_chain(:includes, :find).with(json[:id]).and_return transaction
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return account
			expect(transaction.header).to receive(:update_from_json).with json
			expect(SplitTransaction.update_from_json(json)).to match_json json, account
		end
	end

	describe "#as_json" do
		let(:json) { subject.as_json }

		before :each do
			expect(subject.account).to receive(:as_json).and_return("account json")
		end

		context "outflow" do
			subject { create(:split_to_transaction, status: "Reconciled") }

			it "should return a JSON representation" do
				expect(json).to include(:category => {:id => "SplitTo", :name => "Split To"})
				expect(json).to include(:direction => "outflow")
			end
		end

		context "inflow" do
			subject { create(:split_from_transaction, status: "Reconciled") }

			it "should return a JSON representation" do
				expect(json).to include(:category => {:id => "SplitFrom", :name => "Split From"})
				expect(json).to include(:direction => "inflow")
			end
		end

		after :each do
			expect(json).to include(:primary_account => "account json")
			expect(json).to include(:status => "Reconciled")
		end
	end
end
