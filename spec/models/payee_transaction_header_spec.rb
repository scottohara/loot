require 'rails_helper'

RSpec.describe PayeeTransactionHeader, type: :model do
	describe "#update_from_json" do
		let(:payee) { create :payee }
		let(:header) { create :payee_transaction_header }
		let(:json) { {
			"payee" => {
				"id" => payee.id
			}
		} }

		before :each do
			expect(Payee).to receive(:find_or_new).and_return payee
		end

		it "should update a transaction header from a JSON representation" do
			expect(header.update_from_json(json).payee).to eq payee
		end
	end

	describe "#as_json" do
		subject { create(:payee_transaction_header) }
		let(:json) { subject.as_json }

		before :each do
			expect(subject.payee).to receive(:as_json).and_return("payee json")
		end

		it "should return a JSON representation" do
			expect(json).to include(payee: "payee json")
		end
	end
end
