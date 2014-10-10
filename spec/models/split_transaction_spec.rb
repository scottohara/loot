require 'rails_helper'

RSpec.describe SplitTransaction, :type => :model do
	describe "::create_from_json" do
	end

	describe "::update_from_json" do
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
