require 'test_helper'

describe Payee do
	let(:unsaved_payee) { FactoryGirl.build :payee }
	let(:saved_payee) { FactoryGirl.create :payee }

	#TODO - this will be removed and FactoryGirl.lint used instead
	it "should be valid with valid attributes" do
		unsaved_payee.must_be :valid?
	end

	it "should be invalid without a name" do
		FactoryGirl.build(:payee, :name => nil).wont_be :valid?
	end

	describe "::find_or_new" do
		it "should find an existing payee" do
			payee = Payee.find_or_new({'id' => saved_payee.id})
			payee.must_be_instance_of Payee
			payee.must_equal saved_payee
		end

		it "should create a non-existing payee" do
			payee = Payee.find_or_new unsaved_payee.name
			payee.must_be_instance_of Payee
			payee.must_equal unsaved_payee
		end
	end

	describe "#as_json" do
		let(:json) { {"id" => saved_payee.id, "name" => saved_payee.name} }

		it "should return a JSON-like hash" do
			saved_payee.as_json.must_equal json
		end
	end
end
