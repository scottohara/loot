require 'rails_helper'

RSpec.describe SecurityTransactionHeader, :type => :model do
	matcher :match_json do |expected, security|
		match do |actual|
			actual.quantity.eql? expected['quantity'] and \
			actual.price.eql? expected['price'] and \
			actual.commission.eql? expected['commission'] and \
			actual.security.eql? security
		end
	end

	describe "#update_from_json" do
		let(:security) { create :security }
		let(:header) { create :security_transaction_header }
		let(:json) { {
			"quantity" => 1,
			"price" => 1,
			"commission" => 1,
			"security" => {
				"id" => security.id
			}
		} }

		before :each do
			expect(Security).to receive(:find_or_new).and_return security
		end

		it "should update a transaction header from a JSON representation" do
			expect(header.update_from_json(json)).to match_json json, security
		end
	end

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
