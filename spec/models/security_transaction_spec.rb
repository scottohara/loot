require 'rails_helper'

RSpec.describe SecurityTransaction, :type => :model do
	describe "#as_json" do
		subject { create(:security_holding_transaction) }
		let(:json) { subject.as_json }

		before :each do
			expect(subject.header).to receive(:as_json).and_return(:header => "header json")
		end

		it "should return a JSON representation" do
			expect(json).to include(:header => "header json")
		end
	end
end
