require 'rails_helper'

RSpec.describe Transaction, :type => :model do
	describe "#as_json" do
		let(:json) { subject.as_json }

		context "unflagged" do
			subject { create(:basic_transaction) }

			it "should return a JSON representation" do
				expect(json).to include(:flag => nil)
			end
		end

		context "flagged" do
			subject { create(:basic_transaction, :flagged) }

			it "should return a JSON representation" do
				expect(json).to include(:flag => "Transaction flag")
			end
		end

		after :each do
			expect(json).to include(:id => subject.id)
			expect(json).to include(:transaction_type => "Basic")
			expect(json).to include(:memo => "Basic transaction")
		end
	end
end
