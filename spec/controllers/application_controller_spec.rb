# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::ApplicationController do
	controller do
		include ::FactoryBot::Syntax::Methods

		def index
			case params['context']
			when 'internal error' then raise ::StandardError, params['context']
			when 'record invalid' then raise ::ActiveRecord::RecordInvalid, create(:category, name: nil, direction: 'invalid')
			when 'record not destroyed' then raise ::ActiveRecord::RecordNotDestroyed, create(:category, transactions: 1).destroy!
			when 'record not found' then raise ::ActiveRecord::RecordNotFound, params['context']
			when 'routing error'
				params[:unmatched_route] = params['context']
				routing_error
			else head :ok
			end
		end
	end

	let(:valid_user_name) { 'valid username' }
	let(:valid_password) { 'valid password' }
	let(:invalid_user_name) { 'invalid username' }
	let(:invalid_password) { 'invalid password' }

	before do |example|
		stub_const 'ENV', 'LOOT_USERNAME' => valid_user_name, 'LOOT_PASSWORD' => valid_password
		request.env['HTTP_AUTHORIZATION'] = ::ActionController::HttpAuthentication::Basic.encode_credentials user_name, password if defined? user_name
		get :index, params: {context: example.metadata[:example_group][:description]}
	end

	describe 'unauthenticated user' do
		let(:expected_status) { :unauthorized }

		after do
			expect(response.media_type).to eq 'text/plain'
			expect(response.body).to eq 'Invalid login and/or password'
		end

		context 'with no credentials' do
			it('should respond with a text error message and a 401 Unauthorized status') {} # Empty block
		end

		context 'with invalid username' do
			let(:user_name) { invalid_user_name }
			let(:password) { valid_password }

			it('should respond with a text error message and a 401 Unauthorized status') {} # Empty block
		end

		context 'with invalid password' do
			let(:user_name) { valid_user_name }
			let(:password) { invalid_password }

			it('should respond with a text error message and a 401 Unauthorized status') {} # Empty block
		end
	end

	context 'authenticated user' do
		let(:user_name) { valid_user_name }
		let(:password) { valid_password }

		it('should response with no message and a 200 OK status') {} # Empty block
	end

	context 'internal error', :json, :request do
		let(:expected_status) { :internal_server_error }
		let(:json) { 'internal error' }

		it('should respond with a JSON error message and a 500 Internal Server Error status') {} # Empty block
	end

	context 'record invalid', :json, :request do
		let(:expected_status) { :unprocessable_entity }
		let(:json) { "Name can't be blank, Direction is not included in the list" }

		it('should respond with a JSON error message and a 422 Unprocessable Entity status') {} # Empty block
	end

	context 'record not destroyed', :json, :request do
		let(:expected_status) { :conflict }
		let(:json) { 'Cannot delete record because dependent transaction categories exist' }

		it('should respond with a JSON error message and a 409 Conflict status') {} # Empty block
	end

	context 'record not found', :json, :request do
		let(:expected_status) { :not_found }
		let(:json) { 'record not found' }

		it('should respond with a JSON error message and a 404 Not Found status') {} # Empty block
	end

	context 'routing error', :json, :request do
		let(:expected_status) { :not_found }
		let(:json) { 'Path routing error is not valid' }

		it('should respond with a JSON error message and a 404 Not Found status') {} # Empty block
	end
end
