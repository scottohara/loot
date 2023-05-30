# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::AccountsController do
	describe 'GET index', json: true, request: true do
		context 'for account list' do
			let(:json) { 'account list with balances' }

			before do
				expect(::Account).to receive(:list).and_return json
				get :index, params: {include_balances: true}
			end

			it 'should return the account list including balances' do
				expect(controller.params).to include :include_balances
			end
		end

		context 'for account typeahead' do
			let(:json) { 'account list without balances' }

			before do
				expect(::Account).to receive_message_chain(:all, :order).with({favourite: :desc}, :account_type, :name).and_return json
				get :index
			end

			it 'should return the account list without balances' do
				expect(controller.params).not_to include :include_balances
			end
		end
	end

	describe 'GET show', json: true, request: true do
		let(:json) { 'account details' }

		it 'should return the details of the specified account' do
			expect(::Account).to receive(:find).with('1').and_return json
			get :show, params: {id: '1'}
		end
	end

	describe 'POST create', json: true, request: true do
		let(:request_body) { {name: 'New account', account_type: 'cash', opening_balance: '1000.00', status: 'open', related_account_id: '1', controller: 'accounts', action: 'create'} }
		let(:json) { 'created account' }

		it 'should create a new account and return the details' do
			expect(::Account).to receive(:create_from_json).with(::ActionController::Parameters.new request_body).and_return json
			post :create, params: request_body
		end
	end

	describe 'PATCH update', json: true, request: true do
		let(:request_body) { {id: '1', name: 'Updated account', account_type: 'credit', opening_balance: '2000.00', status: 'closed', related_account_id: '2', controller: 'accounts', action: 'update'} }
		let(:json) { 'updated account' }

		it 'should update an existing account and return the details' do
			expect(::Account).to receive(:update_from_json).with(::ActionController::Parameters.new request_body).and_return json
			patch :update, params: request_body
		end
	end

	describe 'DELETE destroy', request: true do
		let(:account) { ::Account.new }

		it 'should delete an existing account' do
			expect(::Account).to receive(:find).with('1').and_return account
			expect(account).to receive :destroy!
			delete :destroy, params: {id: '1'}
		end
	end

	describe 'PUT reconcile', request: true do
		let(:account) { ::Account.new }

		it 'should return the details of the specified account' do
			expect(::Account).to receive(:find).with('1').and_return account
			expect(account).to receive :reconcile
			put :reconcile, params: {id: '1'}
		end
	end
end
