require 'rails_helper'

RSpec.describe CashTransaction, :type => :model do
	describe "#as_json" do
		subject { create(:basic_transaction) }
		let(:json) { subject.as_json }

		it "should return a JSON representation" do
			expect(json).to include(:amount => 1)
		end
	end
end
