require 'rails_helper'

RSpec.describe TransactionHeader, :type => :model do
	describe "#as_json" do
		let(:json) { subject.as_json }

		context "for schedule" do
			subject { create(:payee_transaction_header) }

			it "should return a JSON representation" do; end
		end

		context "for schedule" do
			pending "schedule not yet implemented"

			subject { create(:payee_transaction_header, :scheduled) }

			before :each do
				expect(subject.schedule).to receive(:as_json).and_return(:schedule => "schedule json")
			end

			it "should return a JSON representation" do
				expect(json).to include(:scheduel => "schedule json")
			end
		end

		after :each do
			expect(json).to include(:transaction_date => subject.transaction_date)
		end
	end
end
