require 'rails_helper'

RSpec.describe SecurityTransferTransaction, :type => :model do
	matcher :match_json do |expected, source_account, destination_account|
		match do |actual|
			actual[:transaction_type].eql? "SecurityTransfer" and \
			actual[:id].eql? expected[:id] and \
			actual[:memo].eql? expected['memo'] and \
			actual[:primary_account][:id].eql? source_account.id and \
			actual[:status].eql? expected['status'] and \
			actual[:account][:id].eql? destination_account.id and \
			actual[:related_status].eql? expected['related_status'] and \
			actual[:price].nil? and \
			actual[:commission].nil?
		end
	end

	describe "::create_from_json" do
		let(:primary_account) { create :investment_account }
		let(:account) { create :investment_account }
		let(:json) { {
			:id => 1,
			"memo" => "Test json",
			"primary_account" => {
				"id" => primary_account.id
			},
			"account" => {
				"id" => account.id
			},
			"status" => "Cleared",
			"related_status" => "Reconciled",
			"price" => 1,
			"commission" => 2
		} }

		before :each do
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return primary_account
			expect(Account).to receive(:find).with(json['account']['id']).and_return account
			expect_any_instance_of(SecurityTransactionHeader).to receive(:update_from_json).with json
			expect_any_instance_of(SecurityTransaction).to receive(:validate_presence).with("quantity")
			expect_any_instance_of(SecurityTransaction).to receive(:validate_absence).with("price")
			expect_any_instance_of(SecurityTransaction).to receive(:validate_absence).with("commission")
		end

		context "outflow" do
			it "should create a transaction from a JSON representation" do
				json["direction"] = "outflow"
			end
		end

		context "inflow" do
			it "should create a transaction from a JSON representation" do
				json["direction"] = "inflow"
			end
		end

		after :each do
			expect(SecurityTransferTransaction.create_from_json(json)).to match_json json, primary_account, account
		end
	end

	describe "::update_from_json" do
		let(:primary_account) { create :investment_account }
		let(:account) { create :investment_account }
		let(:transaction) { create :security_transfer_transaction }
		let(:json) { {
			:id => transaction.id,
			"memo" => "Test json",
			"primary_account" => {
				"id" => primary_account.id
			},
			"account" => {
				"id" => account.id
			}
		} }

		before :each do
			expect(SecurityTransferTransaction).to receive_message_chain(:includes, :find).with(json[:id]).and_return transaction
			expect(Account).to receive(:find).with(json['primary_account']['id']).and_return primary_account
			expect(Account).to receive(:find).with(json['account']['id']).and_return account
			expect(transaction.header).to receive(:update_from_json).with json
		end

		context "outflow" do
			it "should update a transaction from a JSON representation" do
				json["direction"] = "outflow"
			end
		end

		context "inflow" do
			it "should update a transaction from a JSON representation" do
				json["direction"] = "inflow"
			end
		end

		after :each do
			expect(SecurityTransferTransaction.update_from_json(json)).to match_json json, primary_account, account
		end
	end

	describe "#validate_account_uniqueness" do
		subject { SecurityTransferTransaction.new }
		let(:source_account) { create :account }
		let(:error_message) { "Source and destination account can't be the same" }

		before :each do |example|
			subject.build_source_transaction_account(:direction => "outflow").account = source_account
			subject.build_destination_transaction_account(:direction => "inflow").account = destination_account
			subject.validate_account_uniqueness
		end

		context "when the source and destination accounts are the same" do
			let(:destination_account) { source_account }

			it "should be an error" do
				expect(subject.errors[:base]).to include(error_message)
			end
		end

		context "when the source and destination accounts are not the same" do
			let(:destination_account) { create :account }

			it "should not be an error" do
				expect(subject.errors[:base]).to_not include(error_message)
			end
		end
	end

	describe "#as_json" do
		subject { create(:security_transfer_transaction, status: "Reconciled") }

		before :each do
			expect(subject.source_account).to receive(:as_json).and_return("source account json")
			expect(subject.destination_account).to receive(:as_json).and_return("destination account json")
		end

		context "outflow" do
			let(:json) { subject.as_json({:direction => "outflow"}) }

			it "should return a JSON representation" do
				expect(json).to include(:primary_account => "source account json")
				expect(json).to include(:category => {:id => "TransferTo", :name => "Transfer To"})
				expect(json).to include(:account => "destination account json")
				expect(json).to include(:direction => "outflow")
				expect(json).to include(:status => "Reconciled")
				expect(json).to include(:related_status => nil)
			end
		end

		context "inflow" do
			let(:json) { subject.as_json({:direction => "inflow"}) }

			it "should return a JSON representation" do
				expect(json).to include(:primary_account => "destination account json")
				expect(json).to include(:category => {:id => "TransferFrom", :name => "Transfer From"})
				expect(json).to include(:account => "source account json")
				expect(json).to include(:direction => "inflow")
				expect(json).to include(:status => nil)
				expect(json).to include(:related_status => "Reconciled")
			end
		end

		after :each do
			expect(json).to include(:quantity => 10)
		end
	end
end
