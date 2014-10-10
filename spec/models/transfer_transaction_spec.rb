require 'rails_helper'

RSpec.describe TransferTransaction, :type => :model do
	describe "::create_from_json" do
	end

	describe "::update_from_json" do
	end

	describe "#as_json" do
		subject { create(:transfer_transaction, status: "Reconciled") }

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
	end
end
