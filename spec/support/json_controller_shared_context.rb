# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Shared context for JSON controllers
::RSpec.shared_context 'JSON controller' do
	let(:expected_status) { :ok }

	before :each, :request do
		expect(controller).to receive :authenticate_user
		request.env['HTTP_ACCEPT'] = 'application/json'
	end

	after do
		expect(response).to have_http_status expected_status if controller.response
	end

	after :each, :json do
		expect(response.media_type).to eq 'application/json'
		expect(response.body).to eq json
	end
end

::RSpec.configure do |config|
	config.include_context 'JSON controller', type: :controller
end
