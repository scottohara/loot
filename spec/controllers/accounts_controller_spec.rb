require 'rails_helper'

RSpec.describe AccountsController, type: :controller do
	describe "GET index", request: true, json: true do
		context "for account list" do
			let(:json) { "account list with balances" }

			before :each do
				expect(Account).to receive(:list).and_return json
				get :index, include_balances: true
			end

			it "should return the account list including balances" do
				expect(controller.params).to include(:include_balances)
			end
		end

		context "for account typeahead" do
			let(:json) { "account list without balances" }

			before :each do
				expect(Account).to receive_message_chain(:all, :order).with(:account_type, :name).and_return json
				get :index
			end

			it "should return the account list without balances" do
				expect(controller.params).to_not include(:include_balances)
			end
		end
	end

	describe "GET show", request: true, json: true do
		let(:json) { "account details" }

		it "should return the details of the specified account" do
			expect(Account).to receive(:find).with("1").and_return json
			get :show, id: "1"
		end
	end

	describe "PUT reconcile", request: true do
		let(:account) { Account.new }

		it "should return the details of the specified account" do
			expect(Account).to receive(:find).with("1").and_return account
			expect(account).to receive(:reconcile)
			put :reconcile, id: "1"
		end
	end
end
