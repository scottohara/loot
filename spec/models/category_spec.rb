require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Category, :type => :model do
	context "category" do
		it_behaves_like Transactable do
			let(:context_factory) { :category_with_children }
			let(:ledger_json_key) { :category }
			let(:expected_transactions_filter) { "" }
			let(:expected_closing_balances) { {:with_date => -1, :without_date => -2 } }
		end
	end

	context "subcategory" do
		it_behaves_like Transactable do
			let(:context_factory) { :subcategory }
			let(:ledger_json_key) { :subcategory }
			let(:expected_transactions_filter) { "" }
			let(:expected_closing_balances) { {:with_date => -1, :without_date => -2 } }
		end
	end

	describe "#as_json" do
		let(:json) { subject.as_json }

		context "category" do
			subject { create(:category, name: "Test Category", children: 1, transactions: 1) }

			it "should return a JSON representation" do
				expect(json).to include(:parent_id => nil)
				expect(json).to include(:num_children => 1)
				expect(json).to include(:parent => nil)
			end
		end

		context "subcategory" do
			subject { create(:subcategory, name: "Test Category", transactions: 1) }
			let(:parent_json) { {:id => subject.parent.id, :name => subject.parent.name, :direction => subject.parent.direction} }

			before :each do
				expect(CategorySerializer).to receive(:new).with(subject).and_call_original
				expect(CategorySerializer).to receive(:new).with(subject.parent, :only => [:id, :name, :direction]).and_return(parent_json)
			end

			it "should return a JSON representation" do
				expect(json).to include(:parent_id => subject.parent.id)
				expect(json).to include(:num_children => 0)
				expect(json).to include(:parent => parent_json)
			end
		end

		after :each do
			expect(json).to include(:id => subject.id)
			expect(json).to include(:name => "Test Category")
			expect(json).to include(:direction => "outflow")
			expect(json).to include(:closing_balance => subject.closing_balance)
			expect(json).to include(:num_transactions => 1)
		end
	end
end
