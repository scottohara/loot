require 'rails_helper'

RSpec.describe FavouritesController, type: :controller do
	shared_context "for account", :account do
		let(:context) { create :account }
		let(:request_params) { {"account_id" => "1"} }
	end

	shared_context "for payee", :payee do
		let(:context) { Payee.new }
		let(:request_params) { {"payee_id" => "1"} }
	end

	shared_context "for category", :category do
		let(:context) { Category.new }
		let(:request_params) { {"category_id" => "1"} }
	end

	shared_context "for security", :security do
		let(:context) { Security.new }
		let(:request_params) { {"security_id" => "1"} }
	end

	before :each do
		expect(context.class).to receive(:find).with("1").and_return context
		expect(context).to receive(:update_attributes!).with(favourite: favourite)
	end

	describe "PATCH update", request: true do
		let(:favourite) { true }

		before :each do
			patch :update, request_params
		end

		it "should favourite an account", account: true do; end
		it "should favourite a payee", payee: true do; end
		it "should favourite a category", category: true do; end
		it "should favourite a security", security: true do; end
	end

	describe "DELETE destroy", request: true do
		let(:favourite) { false }

		before :each do
			delete :destroy, request_params
		end

		it "should unfavourite an account", account: true do; end
		it "should favourite a payee", payee: true do; end
		it "should favourite a category", category: true do; end
		it "should favourite a security", security: true do; end
	end
end
