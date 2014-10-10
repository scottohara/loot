require 'rails_helper'

RSpec.describe PayeeTransactionHeader, :type => :model do
	describe "#as_json" do
		subject { create(:payee_transaction_header) }
		let(:json) { subject.as_json }

		before :each do
			expect(subject.payee).to receive(:as_json).and_return("payee json")
		end

		it "should return a JSON representation" do
			expect(json).to include(:payee => "payee json")
		end
	end
end
