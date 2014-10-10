require 'rails_helper'

RSpec.describe SubtransferTransaction, :type => :model do
	describe "::create_from_json" do
	end

	describe "::update_from_json" do
	end

	describe "#as_json" do
		subject { create(:subtransfer_transaction, status: "Reconciled") }

		before :each do
			expect(subject.account).to receive(:as_json).and_return("account json")
			expect(subject.parent.account).to receive(:as_json).and_return("parent account json")
		end

		context "outflow" do
			let(:json) { subject.as_json({:direction => "outflow"}) }

			it "should return a JSON representation" do
				pending "this is failing because the factory set the direction to be the reverse of the parent.  Not sure if this is correct?"
				expect(json).to include(:category => {:id => "TransferTo", :name => "Transfer To"})

				#TODO - this is failing because the factory set the direction to be the reverse of the parent.  Not sure if this is correct?
				expect(json).to include(:direction => "outflow")
			end
		end

		context "inflow" do
			let(:json) { subject.as_json({:direction => "inflow"}) }

			it "should return a JSON representation" do
				expect(json).to include(:category => {:id => "TransferFrom", :name => "Transfer From"})
				expect(json).to include(:direction => "inflow")
			end
		end

		after :each do
			expect(json).to include(:primary_account => "account json")
			expect(json).to include(:account => "parent account json")
			expect(json).to include(:status => "Reconciled")
			expect(json).to include(:related_status => nil)
			expect(json).to include(:parent_id => subject.parent.id)
		end
	end
end
