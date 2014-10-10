require 'rails_helper'

RSpec.describe SecurityInvestmentTransaction, :type => :model do
	describe "::create_from_json" do
	end

	describe "::update_from_json" do
	end

	describe "#as_json" do
		subject { create(:security_investment_transaction, status: "Reconciled") }

		before :each do
			expect(subject.investment_account.account).to receive(:as_json).and_return("investment account json")
			expect(subject.cash_account.account).to receive(:as_json).and_return("cash account json")
		end

		context "for investment account" do
			let(:json) { subject.as_json }

			it "should return a JSON representation" do
				expect(json).to include(:primary_account => "investment account json")
				expect(json).to include(:category => {:id => "Buy", :name => "Buy"})
				expect(json).to include(:account => "cash account json")
				expect(json).to include(:direction => "inflow")
				expect(json).to include(:status => "Reconciled")
				expect(json).to include(:related_status => nil)
			end
		end

		context "for cash account" do
			let(:json) { subject.as_json({:primary_account => subject.cash_account.account_id}) }

			it "should return a JSON representation" do
				expect(json).to include(:primary_account => "cash account json")
				expect(json).to include(:category => {:id => "TransferTo", :name => "Transfer To"})
				expect(json).to include(:account => "investment account json")
				expect(json).to include(:direction => "outflow")
				expect(json).to include(:status => nil)
				expect(json).to include(:related_status => "Reconciled")
			end
		end

		after :each do
			expect(json).to include(:amount => 2)
			expect(json).to include(:quantity => 1)
			expect(json).to include(:price => 1)
			expect(json).to include(:commission => 1)
		end
	end
end
