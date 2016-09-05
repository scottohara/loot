# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true
require 'spec_helper'

describe 'payees routes' do
	# Collection routes
	it 'should route GET /payees to payees#index' do
		expect(get: '/payees').to route_to controller: 'payees', action: 'index'
	end

	it 'should route POST /payees to payees#create' do
		expect(post: '/payees').to route_to controller: 'payees', action: 'create'
	end

	# Member routes
	it 'should route GET /payees/:id to payees#show' do
		expect(get: '/payees/1').to route_to controller: 'payees', action: 'show', id: '1'
	end

	it 'should route PATCH /payees/:id to payees#update' do
		expect(patch: '/payees/1').to route_to controller: 'payees', action: 'update', id: '1'
	end

	it 'should route PUT /payees/:id to payees#update' do
		expect(put: '/payees/1').to route_to controller: 'payees', action: 'update', id: '1'
	end

	it 'should route DELETE /payees/:id to payees#destroy' do
		expect(delete: '/payees/1').to route_to controller: 'payees', action: 'destroy', id: '1'
	end

	it 'should not route GET /payees/:id/edit' do
		expect(get: '/payees/1/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'payees/1/edit'
	end

	# Transactions collection routes
	it 'should route GET /payees/:payee_id/transactions to transactions#index' do
		expect(get: '/payees/1/transactions').to route_to controller: 'transactions', action: 'index', payee_id: '1'
	end

	it 'should not route GET /payees/:payee_id/transactions/new' do
		expect(get: '/payees/1/transactions/new').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'payees/1/transactions/new'
	end

	# Transactions member routes
	it 'should not route GET /payees/:payee_id/transactions/:id' do
		expect(get: '/payees/1/transactions/2').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'payees/1/transactions/2'
	end

	it 'should not route GET /payees/:payee_id/transactions/:id/edit' do
		expect(get: '/payees/1/transactions/2/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'payees/1/transactions/2/edit'
	end

	it 'should not route PATCH /payees/:payee_id/transactions/:id' do
		expect(patch: '/payees/1/transactions/2').to_not be_routable
	end

	it 'should not route PUT /payees/:payee_id/transactions/:id' do
		expect(put: '/payees/1/transactions/2').to_not be_routable
	end

	it 'should not route DELETE /payees/:payee_id/transactions/:id' do
		expect(delete: '/payees/1/transactions/2').to_not be_routable
	end

	# Defaultable routes
	it 'should route GET /payees/:payee_id/transactions/last to transactions#last' do
		expect(get: '/payees/1/transactions/last').to route_to controller: 'transactions', action: 'last', payee_id: '1'
	end

	# Favouritable routes
	it 'should route PATCH /payees/:payee_id/favourite to favourites#update' do
		expect(patch: '/payees/1/favourite').to route_to controller: 'favourites', action: 'update', payee_id: '1'
	end

	it 'should route PUT /payees/:payee_id/favourite to favourites#update' do
		expect(put: '/payees/1/favourite').to route_to controller: 'favourites', action: 'update', payee_id: '1'
	end

	it 'should route DELETE /payees/:payee_id/favourite to favourites#destroy' do
		expect(delete: '/payees/1/favourite').to route_to controller: 'favourites', action: 'destroy', payee_id: '1'
	end

	it 'should not route GET /payees/:payee_id/favourite' do
		expect(get: '/payees/1/favourite').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'payees/1/favourite'
	end
end
