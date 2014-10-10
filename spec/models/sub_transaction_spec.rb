require 'rails_helper'

RSpec.describe SubTransaction, :type => :model do
	describe "::create_from_json" do
	end

	describe "::update_from_json" do
	end

	describe "#as_json" do
		let(:json) { subject.as_json }

		before :each do
			expect(subject.parent.account).to receive(:as_json).and_return("parent account json")
		end

		context "with category" do
			subject { create(:sub_transaction) }

			before :each do
				expect(subject.category).to receive(:as_json).and_return("category json")
			end

			it "should return a JSON representation" do
				expect(json).to include(:category => "category json")
				expect(json).to include(:subcategory => nil)
			end
		end

		context "with subcategory" do
			subject { create(:sub_transaction, category: FactoryGirl.create(:subcategory)) }

			before :each do
				expect(subject.category.parent).to receive(:as_json).and_return("category json")
				expect(subject.category).to receive(:as_json).and_return("subcategory json")
			end

			it "should return a JSON representation" do
				expect(json).to include(:category => "category json")
				expect(json).to include(:subcategory => "subcategory json")
			end
		end

		after :each do
			expect(json).to include(:primary_account => "parent account json")
			expect(json).to include(:direction => "outflow")
			expect(json).to include(:parent_id => subject.parent.id)
		end
	end
end
