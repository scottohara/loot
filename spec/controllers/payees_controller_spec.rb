require 'rails_helper'

RSpec.describe PayeesController, type: :controller do
	describe "GET index", request: true, json: true do
		let(:json) { "payee list" }

		context "for payee list" do
			before :each do
				expect(Payee).to receive(:order).with(:name).and_return json
				get :index, params: {list: true}
			end

			it "should return the payee list in name order" do; end
		end

		context "for payee typeahead" do
			before :each do
				expect(Payee).to receive(:order).with({favourite: :desc}, :name).and_return json
				get :index
			end

			it "should return the payee list with favourites first" do; end
		end
	end

	describe "GET show", request: true, json: true do
		let(:json) { "payee details" }

		it "should return the details of the specified payee" do
			expect(Payee).to receive(:find).with("1").and_return json
			get :show, params: {id: "1"}
		end
	end

	describe "POST create", request: true, json: true do
		let(:request_body) { {name: "New payee"} }
		let(:json) { "created payee" }

		it "should create a new payee and return the details" do
			expect(Payee).to receive(:create).with(request_body).and_return json
			post :create, params: request_body
		end
	end

	describe "PATCH update", request: true, json: true do
		let(:payee) { double "payee" }
		let(:request_body) { {name: "Updated payee"} }
		let(:raw_json) { "updated payee" }
		let(:json) { JSON.dump raw_json }

		it "should update an existing payee and return the details" do
			expect(Payee).to receive(:find).with("1").and_return payee
			expect(payee).to receive(:update_attributes!).with(request_body)
			expect(payee).to receive(:as_json).and_return raw_json
			patch :update, params: request_body.merge(id: "1")
		end
	end

	describe "DELETE destroy", request: true do
		let(:payee) { Payee.new }

		it "should delete an existing payee" do
			expect(Payee).to receive(:find).with("1").and_return payee
			expect(payee).to receive(:destroy)
			delete :destroy, params: {id: "1"}
		end
	end
end
