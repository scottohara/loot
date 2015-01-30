require 'rails_helper'

RSpec.describe PayeeCashTransaction, type: :model do
	describe "::create_from_json" do
		let(:json) { {} }

		before :each do
			expect_any_instance_of(PayeeTransactionHeader).to receive(:update_from_json).with(json)
		end


		it "should create a transaction from a JSON representation" do
			PayeeCashTransaction.create_from_json json
		end
	end

	describe "#update_from_json" do
		subject { PayeeCashTransaction.new }
		let(:json) { {} }

		before :each do
			subject.build_header
			expect(subject.header).to receive(:update_from_json).with(json)
		end

		it "should update a transaction from a JSON representation" do
			subject.update_from_json json
		end
	end

	describe "#as_json" do
		subject { create(:basic_transaction) }
		let(:json) { subject.as_json }

		before :each do
			expect(subject.header).to receive(:as_json).and_return(header: "header json")
		end

		it "should return a JSON representation" do
			expect(json).to include(header: "header json")
		end
	end
end
