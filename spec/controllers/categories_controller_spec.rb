require 'rails_helper'

RSpec.describe CategoriesController, type: :controller do
	describe "GET index ", request: true, json: true do
		context "for category list" do
			let(:json) { "category list with children" }

			before :each do
				expect(Category).to receive_message_chain(:where, :includes, :order).with(:direction, :name).and_return json
				get :index, include_children: true
			end

			it "should return the category list including children" do
				expect(controller.params).to include(:include_children)
			end
		end

		context "for category typeahead" do
			let(:json) { "category list without children" }

			before :each do
				expect(Category).to receive_message_chain(:where, :order).with(:direction, :name).and_return json
				get :index
			end

			it "should return the category list without children" do
				expect(controller.params).to_not include(:include_children)
			end
		end
	end

	describe "GET show", request: true, json: true do
		let(:json) { "category details" }

		it "should return the details of the specified category" do
			expect(Category).to receive(:find).with("1").and_return json
			get :show, id: "1"
		end
	end

	describe "POST create", request: true, json: true do
		let(:request_body) { {name: "New category", direction: "outflow", parent_id: "1"} }
		let(:json) { "created category" }

		it "should create a new category and return the details" do
			expect(Category).to receive(:create).with(request_body).and_return json
			post :create, request_body
		end
	end

	describe "PATCH update", request: true, json: true do
		let(:category) { double "category" }
		let(:request_body) { {name: "Updated category", direction: "outflow", parent_id: "1"} }
		let(:raw_json) { "updated category" }
		let(:json) { JSON.dump raw_json }

		it "should update an existing category and return the details" do
			expect(Category).to receive(:find).with("1").and_return category
			expect(category).to receive(:update_attributes!).with(request_body)
			expect(category).to receive(:as_json).and_return raw_json
			patch :update, request_body.merge(id: "1")
		end
	end

	describe "DELETE destroy", request: true do
		let(:category) { Category.new }

		it "should delete an existing category" do
			expect(Category).to receive(:find).with("1").and_return category
			expect(category).to receive(:destroy)
			delete :destroy, id: "1"
		end
	end
end
