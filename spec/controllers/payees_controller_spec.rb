# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::PayeesController do
	describe 'GET index', :json, :request do
		let(:json) { 'payee list' }

		context 'for payee list' do
			before do
				expect(::Payee).to receive(:order).with(:name).and_return json
				get :index, params: {list: true}
			end

			it('should return the payee list in name order') {} # Empty block
		end

		context 'for payee typeahead' do
			before do
				expect(::Payee).to receive(:order).with({favourite: :desc}, :name).and_return json
				get :index
			end

			it('should return the payee list with favourites first') {} # Empty block
		end
	end

	describe 'GET show', :json, :request do
		let(:json) { 'payee details' }

		it 'should return the details of the specified payee' do
			expect(::Payee).to receive(:find).with('1').and_return json
			get :show, params: {id: '1'}
		end
	end

	describe 'POST create', :json, :request do
		let(:request_body) { {name: 'New payee'} }
		let(:json) { 'created payee' }

		it 'should create a new payee and return the details' do
			expect(::Payee).to receive(:create!).with(request_body).and_return json
			post :create, params: request_body
		end
	end

	describe 'PATCH update', :json, :request do
		let(:payee) { instance_double ::Payee }
		let(:request_body) { {name: 'Updated payee'} }
		let(:raw_json) { 'updated payee' }
		let(:json) { ::JSON.dump raw_json }

		it 'should update an existing payee and return the details' do
			expect(::Payee).to receive(:find).with('1').and_return payee
			expect(payee).to receive(:update!).with request_body
			expect(payee).to receive(:as_json).and_return raw_json
			patch :update, params: request_body.merge(id: '1')
		end
	end

	describe 'DELETE destroy', :request do
		let(:payee) { ::Payee.new }

		it 'should delete an existing payee' do
			expect(::Payee).to receive(:find).with('1').and_return payee
			expect(payee).to receive :destroy!
			delete :destroy, params: {id: '1'}
		end
	end
end
