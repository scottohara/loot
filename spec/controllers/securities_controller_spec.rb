# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::SecuritiesController, type: :controller do
	describe 'GET index', request: true, json: true do
		context 'for security list' do
			let(:json) { 'security list with balances' }

			before do
				expect(::Security).to receive(:list).and_return json
				get :index, params: {include_balances: true}
			end

			it 'should return the security list including balances' do
				expect(controller.params).to include :include_balances
			end
		end

		context 'for security typeahead' do
			let(:json) { 'security list without balances' }

			before do
				expect(::Security).to receive(:order).with({favourite: :desc}, :name).and_return json
				get :index
			end

			it 'should return the security list without balances' do
				expect(controller.params).not_to include :include_balances
			end
		end
	end

	describe 'GET show', request: true, json: true do
		let(:json) { 'security details' }

		it 'should return the details of the specified security' do
			expect(::Security).to receive(:find).with('1').and_return json
			get :show, params: {id: '1'}
		end
	end

	describe 'POST create', request: true, json: true do
		let(:request_body) { {name: 'New security', code: 'ABC'} }
		let(:json) { 'created security' }

		it 'should create a new security and return the details' do
			expect(::Security).to receive(:create!).with(request_body).and_return json
			post :create, params: request_body
		end
	end

	describe 'PATCH update', request: true, json: true do
		let(:security) { instance_double 'security' }
		let(:request_body) { {name: 'Updated security', code: 'ABC'} }
		let(:raw_json) { 'updated security' }
		let(:json) { ::JSON.dump raw_json }

		it 'should update an existing security and return the details' do
			expect(::Security).to receive(:find).with('1').and_return security
			expect(security).to receive(:update!).with request_body
			expect(security).to receive(:as_json).and_return raw_json
			patch :update, params: request_body.merge(id: '1')
		end
	end

	describe 'DELETE destroy', request: true do
		let(:security) { ::Security.new }

		it 'should delete an existing security' do
			expect(::Security).to receive(:find).with('1').and_return security
			expect(security).to receive :destroy!
			delete :destroy, params: {id: '1'}
		end
	end
end
