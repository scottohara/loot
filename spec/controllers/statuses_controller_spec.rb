require 'rails_helper'

RSpec.describe StatusesController, type: :controller do
	before :each do
		expect(TransactionAccount).to receive_message_chain(:where, :where, :update_all).with(status: status)
	end

	describe "PATCH update", request: true do
		before :each do
			patch :update, account_id: "1", transaction_id: "1", (status || request_status) => true
		end

		context "Cleared" do
			let(:status) { "Cleared" }
			
			it "should update the status" do; end
		end


		context "Reconciled" do
			let(:status) { "Reconciled" }

			it "should update the existing flag" do; end
		end

		context "invalid status" do
			let(:request_status) { "invalid" }
			let(:status) { nil }

			it "should set the status to nil" do; end
		end
	end

	describe "DELETE destroy", request: true do
		let(:status) { nil }

		it "should clear the existing status" do
			delete :destroy, account_id: "1", transaction_id: "1"
		end
	end
end
