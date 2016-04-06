require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Category, type: :model do
	context "category" do
		it_behaves_like Transactable do
			let(:context_factory) { :category_with_children }
			let(:ledger_json_key) { :category }
			let(:expected_closing_balances) { {with_date: -1, without_date: -2 } }
		end
	end

	context "subcategory" do
		it_behaves_like Transactable do
			let(:context_factory) { :subcategory }
			let(:ledger_json_key) { :subcategory }
			let(:expected_closing_balances) { {with_date: -1, without_date: -2 } }
		end
	end

	describe "::find_or_new" do
		context "existing category" do
			let(:category) { create :category }

			it "should return the existing category" do
				expect(Category.find_or_new({"id" => category.id})).to eq category
			end
		end

		context "new category" do
			let(:category_name) { "New category" }

			it "should return a newly created category" do
				category = Category.find_or_new category_name
				expect(category.name).to eq category_name
				expect(category.direction).to eq "outflow"
				expect(category.parent).to be_nil
			end

			context "with parent" do
				let(:parent) { create :inflow_category }

				it "should return a newly created category" do
					category = Category.find_or_new category_name, parent
					expect(category.name).to eq category_name
					expect(category.direction).to eq "inflow"
					expect(category.parent).to eq parent
				end
			end
		end
	end

	describe "#opening_balance" do
		subject { create(:category) }

		it "should return zero" do
			expect(subject.opening_balance).to eq 0
		end
	end

	describe "#account_type" do
		subject { create(:category) }

		it "should return nil" do
			expect(subject.account_type).to be_nil
		end
	end

	describe "#as_json" do
		context "with default options" do
			let(:json) { subject.as_json }

			before :each do
				expect(CategorySerializer).to receive(:new).with(subject, only: [:id, :name, :direction, :parent_id, :favourite]).and_call_original
			end

			context "category" do
				subject { create(:category, name: "Test Category", children: 1, transactions: 1) }

				it "should return a JSON representation excluding children" do
					expect(json).to include(parent_id: nil)
				end
			end

			context "subcategory" do
				subject { create(:subcategory, name: "Test Category", transactions: 1) }

				it "should return a JSON representation excluding parent" do
					expect(json).to include(parent_id: subject.parent.id)
				end
			end
		end

		context "with empty options" do
			let(:json) { subject.as_json({}) }

			context "category" do
				subject { create(:category, name: "Test Category", children: 1, transactions: 1) }

				it "should return a JSON representation including children" do
					expect(json).to include(parent_id: nil)
					expect(json).to include(num_children: 1)
					expect(json).to include(parent: nil)
				end
			end

			context "subcategory" do
				subject { create(:subcategory, name: "Test Category", transactions: 1) }
				let(:parent_json) { {id: subject.parent.id, name: subject.parent.name, direction: subject.parent.direction} }

				before :each do
					expect(CategorySerializer).to receive(:new).with(subject, {}).and_call_original
					expect(CategorySerializer).to receive(:new).with(subject.parent, only: [:id, :name, :direction]).and_return(parent_json)
				end

				it "should return a JSON representation including parent" do
					expect(json).to include(parent_id: subject.parent.id)
					expect(json).to include(num_children: 0)
					expect(json).to include(parent: parent_json)
				end
			end

			after :each do
				expect(json).to include(closing_balance: subject.closing_balance)
				expect(json).to include(num_transactions: 1)
			end
		end

		after :each do
			expect(json).to include(id: subject.id)
			expect(json).to include(name: "Test Category")
			expect(json).to include(direction: "outflow")
			expect(json).to include(favourite: false)
		end
	end
end
