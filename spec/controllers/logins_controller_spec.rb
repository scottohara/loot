require 'rails_helper'

RSpec.describe LoginsController, :type => :controller do
	describe "POST create", :request => true do
		let(:expected_status) { :created }

		it "should update the status" do
			expect(Schedule).to receive :auto_enter_overdue
			post :create
		end
	end
end
