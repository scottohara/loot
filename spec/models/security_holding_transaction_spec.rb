require 'rails_helper'

RSpec.describe SecurityHoldingTransaction, :type => :model do
	describe "::create_from_json" do
	end

	describe "::update_from_json" do
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
