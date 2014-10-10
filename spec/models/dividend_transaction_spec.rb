require 'rails_helper'

RSpec.describe DividendTransaction, :type => :model do
	describe "::create_from_json" do
	end

	describe "::update_from_json" do
	end

	describe "#as_json" do
		subject { create(:dividend_transaction, status: "Reconciled") }

		before :each do
			expect(subject.investment_account.account).to receive(:as_json).and_return("investment account json")
			expect(subject.cash_account.account).to receive(:as_json).and_return("cash account json")
		end

		context "for investment account" do
			let(:json) { subject.as_json }

			it "should return a JSON representation" do
				expect(json).to include(:primary_account => "investment account json")
				expect(json).to include(:category => {:id => "DividendTo", :name => "Dividend To"})
				expect(json).to include(:account => "cash account json")
				expect(json).to include(:direction => "outflow")
			end
		end

		context "for cash account" do
			let(:json) { subject.as_json({:primary_account => subject.cash_account.account_id}) }

			it "should return a JSON representation" do
				expect(json).to include(:primary_account => "cash account json")
				expect(json).to include(:category => {:id => "DividendFrom", :name => "Dividend From"})
				expect(json).to include(:account => "investment account json")
				expect(json).to include(:direction => "inflow")
			end
		end

		after :each do
			expect(json).to include(:amount => 1)
			expect(json).to include(:status => "Reconciled")
		end
	end
end
