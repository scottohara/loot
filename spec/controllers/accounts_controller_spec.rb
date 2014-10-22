require 'rails_helper'

RSpec.describe AccountsController, :type => :controller do
	before :each do
		expect(controller).to receive(:authenticate_user)
		request.env['HTTP_ACCEPT'] = 'application/json'
	end

	describe "GET index" do
		context "for account list" do
			let(:json) { "account list with balances "}

			before :each do
				expect(Account).to receive(:list).and_return json
				get :index, :include_balances => true
			end

			it "should return the account list including balances" do
				expect(controller.params).to include(:include_balances)
			end
		end

		context "for account typeahead" do
			let(:json) { "account list without balances "}

			before :each do
				expect(Account).to receive_message_chain(:all, :order).with(:account_type, :name).and_return json
				get :index
			end

			it "should return the account list without balances" do
				expect(controller.params).to_not include(:include_balances)
			end
		end

		#:except => [:closing_balance, :num_transactions]
		after :each do
			expect(response).to have_http_status 200
			expect(response.content_type).to eq "application/json"
			expect(response.body).to eq json
		end
	end
end
