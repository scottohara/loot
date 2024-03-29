# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::LoginsController do
	describe 'POST create', :request do
		let(:expected_status) { :created }

		it 'should update the status' do
			expect(::Schedule).to receive :auto_enter_overdue
			post :create
		end
	end
end
