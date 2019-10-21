# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'spec_helper'

describe 'accounts routes', type: :routing do
	# Collection routes
	it 'should route GET /accounts to accounts#index' do
		expect(get: '/accounts').to route_to controller: 'accounts', action: 'index'
	end

	it 'should route POST /accounts to accounts#create' do
		expect(post: '/accounts').to route_to controller: 'accounts', action: 'create'
	end

	# Member routes
	it 'should route GET /accounts/:id to accounts#show' do
		expect(get: '/accounts/1').to route_to controller: 'accounts', action: 'show', id: '1'
	end

	it 'should route PATCH /accounts/:id to accounts#update' do
		expect(patch: '/accounts/1').to route_to controller: 'accounts', action: 'update', id: '1'
	end

	it 'should route PUT /accounts/:id to accounts#update' do
		expect(put: '/accounts/1').to route_to controller: 'accounts', action: 'update', id: '1'
	end

	it 'should route DELETE /accounts/:id to accounts#destroy' do
		expect(delete: '/accounts/1').to route_to controller: 'accounts', action: 'destroy', id: '1'
	end

	it 'should route PUT /accounts/:id/reconcile to accounts#reconcile' do
		expect(put: '/accounts/1/reconcile').to route_to controller: 'accounts', action: 'reconcile', id: '1'
	end

	it 'should not route GET /accounts/:id/edit' do
		expect(get: '/accounts/1/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'accounts/1/edit'
	end

	# Transactions collection routes
	it 'should route GET /accounts/:account_id/transactions to transactions#index' do
		expect(get: '/accounts/1/transactions').to route_to controller: 'transactions', action: 'index', account_id: '1'
	end

	it 'should not route GET /accounts/:account_id/transactions/new' do
		expect(get: '/accounts/1/transactions/new').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'accounts/1/transactions/new'
	end

	# Transactions member routes
	it 'should not route GET /accounts/:account_id/transactions/:id' do
		expect(get: '/accounts/1/transactions/2').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'accounts/1/transactions/2'
	end

	it 'should not route GET /accounts/:account_id/transactions/:id/edit' do
		expect(get: '/accounts/1/transactions/2/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'accounts/1/transactions/2/edit'
	end

	it 'should not route PATCH /accounts/:account_id/transactions/:id' do
		expect(patch: '/accounts/1/transactions/2').not_to be_routable
	end

	it 'should not route PUT /accounts/:account_id/transactions/:id' do
		expect(put: '/accounts/1/transactions/2').not_to be_routable
	end

	it 'should not route DELETE /accounts/:account_id/transactions/:id' do
		expect(delete: '/accounts/1/transactions/2').not_to be_routable
	end

	# Reconcilable routes
	it 'should route PATCH /accounts/:account_id/transactions/:transaction_id/status to statuses#update' do
		expect(patch: '/accounts/1/transactions/2/status').to route_to controller: 'statuses', action: 'update', account_id: '1', transaction_id: '2'
	end

	it 'should route PUT /accounts/:account_id/transactions/:transaction_id/status to statuses#update' do
		expect(put: '/accounts/1/transactions/2/status').to route_to controller: 'statuses', action: 'update', account_id: '1', transaction_id: '2'
	end

	it 'should route DELETE /accounts/:account_id/transactions/:transaction_id/status to statuses#destroy' do
		expect(delete: '/accounts/1/transactions/2/status').to route_to controller: 'statuses', action: 'destroy', account_id: '1', transaction_id: '2'
	end

	it 'should not route GET /accounts/:account_id/transactions/:transaction_id/status' do
		expect(get: '/accounts/1/transactions/2/status').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'accounts/1/transactions/2/status'
	end

	# Defaultable routes
	it 'should route GET /accounts/:account_id/transactions/last to transactions#last' do
		expect(get: '/accounts/1/transactions/last').to route_to controller: 'transactions', action: 'last', account_id: '1'
	end

	# Favouritable routes
	it 'should route PATCH /accounts/:account_id/favourite to favourites#update' do
		expect(patch: '/accounts/1/favourite').to route_to controller: 'favourites', action: 'update', account_id: '1'
	end

	it 'should route PUT /accounts/:account_id/favourite to favourites#update' do
		expect(put: '/accounts/1/favourite').to route_to controller: 'favourites', action: 'update', account_id: '1'
	end

	it 'should route DELETE /accounts/:account_id/favourite to favourites#destroy' do
		expect(delete: '/accounts/1/favourite').to route_to controller: 'favourites', action: 'destroy', account_id: '1'
	end

	it 'should not route GET /accounts/:account_id/favourite' do
		expect(get: '/accounts/1/favourite').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'accounts/1/favourite'
	end
end
