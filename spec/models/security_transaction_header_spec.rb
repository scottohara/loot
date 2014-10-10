require 'rails_helper'

RSpec.describe SecurityTransactionHeader, :type => :model do
	describe "#as_json" do
		subject { create(:security_transaction_header) }
		let(:json) { subject.as_json }

		before :each do
			expect(subject.security).to receive(:as_json).and_return("security json")
		end

		it "should return a JSON representation" do
			expect(json).to include(:security => "security json")
		end
	end
end
