require 'rails_helper'

RSpec.describe SecurityTransaction, type: :model do
	describe "::create_from_json" do
		let(:json) { {} }

		before :each do
			expect_any_instance_of(SecurityTransactionHeader).to receive(:update_from_json).with(json)
		end


		it "should create a transaction from a JSON representation" do
			SecurityTransaction.create_from_json json
		end
	end

	describe "#update_from_json" do
		subject { SecurityTransaction.new }
		let(:json) { {} }

		before :each do
			subject.build_header
			expect(subject.header).to receive(:update_from_json).with(json)
		end

		it "should update a transaction from a JSON representation" do
			subject.update_from_json json
		end
	end

	describe "#method_missing" do
		subject { SecurityTransaction.new }

		context "validate presence" do
			it "should call #validate_presence" do
				expect(subject).to receive(:validate_presence).with("foo")
				subject.validate_foo_presence
			end
		end

		context "validate absence" do
			it "should call #validate_absence" do
				expect(subject).to receive(:validate_absence).with("foo")
				subject.validate_foo_absence
			end
		end

		context "unknown method" do
			it "should call super" do
				expect_any_instance_of(Transaction).to receive(:method_missing).with(:unknown_method)
				subject.unknown_method
			end
		end
	end

	describe "#validate_presence" do
		subject { SecurityTransaction.new }
		let(:error_message) { "Price can't be blank" }

		before :each do
			subject.build_header
		end

		it "should be an error if the attribute is blank" do
			subject.validate_presence "price"
			expect(subject.errors[:base]).to include(error_message)
		end

		it "should not be an error if the attribute is not blank" do
			subject.header.price = 1
			subject.validate_presence "price"
			expect(subject.errors[:base]).to_not include(error_message)
		end
	end

	describe "#validate_absence" do
		subject { SecurityTransaction.new }
		let(:error_message) { "Price must be blank" }

		before :each do
			subject.build_header
		end

		it "should be an error if the attribute is not blank" do
			subject.header.price = 1
			subject.validate_absence "price"
			expect(subject.errors[:base]).to include(error_message)
		end

		it "should not be an error if the attribute is blank" do
			subject.validate_absence "price"
			expect(subject.errors[:base]).to_not include(error_message)
		end
	end

	describe "#as_json" do
		subject { create(:security_holding_transaction) }
		let(:json) { subject.as_json }

		before :each do
			expect(subject.header).to receive(:as_json).and_return(header: "header json")
		end

		it "should return a JSON representation" do
			expect(json).to include(header: "header json")
		end
	end
end
