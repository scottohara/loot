# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'spec_helper'

describe 'securities routes' do
	# Collection routes
	it 'should route GET /securities to securities#index' do
		expect(get: '/securities').to route_to controller: 'securities', action: 'index'
	end

	it 'should route POST /securities to securities#create' do
		expect(post: '/securities').to route_to controller: 'securities', action: 'create'
	end

	# Member routes
	it 'should route GET /securities/:id to securities#show' do
		expect(get: '/securities/1').to route_to controller: 'securities', action: 'show', id: '1'
	end

	it 'should route PATCH /securities/:id to securities#update' do
		expect(patch: '/securities/1').to route_to controller: 'securities', action: 'update', id: '1'
	end

	it 'should route PUT /securities/:id to securities#update' do
		expect(put: '/securities/1').to route_to controller: 'securities', action: 'update', id: '1'
	end

	it 'should route DELETE /securities/:id to securities#destroy' do
		expect(delete: '/securities/1').to route_to controller: 'securities', action: 'destroy', id: '1'
	end

	it 'should not route GET /securities/:id/edit' do
		expect(get: '/securities/1/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'securities/1/edit'
	end

	# Transactions collection routes
	it 'should route GET /securities/:security_id/transactions to transactions#index' do
		expect(get: '/securities/1/transactions').to route_to controller: 'transactions', action: 'index', security_id: '1'
	end

	it 'should not route GET /securities/:security_id/transactions/new' do
		expect(get: '/securities/1/transactions/new').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'securities/1/transactions/new'
	end

	# Transactions member routes
	it 'should not route GET /securities/:security_id/transactions/:id' do
		expect(get: '/securities/1/transactions/2').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'securities/1/transactions/2'
	end

	it 'should not route GET /securities/:security_id/transactions/:id/edit' do
		expect(get: '/securities/1/transactions/2/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'securities/1/transactions/2/edit'
	end

	it 'should not route PATCH /securities/:security_id/transactions/:id' do
		expect(patch: '/securities/1/transactions/2').not_to be_routable
	end

	it 'should not route PUT /securities/:security_id/transactions/:id' do
		expect(put: '/securities/1/transactions/2').not_to be_routable
	end

	it 'should not route DELETE /securities/:security_id/transactions/:id' do
		expect(delete: '/securities/1/transactions/2').not_to be_routable
	end

	# Defaultable routes
	it 'should route GET /securities/:security_id/transactions/last to transactions#last' do
		expect(get: '/securities/1/transactions/last').to route_to controller: 'transactions', action: 'last', security_id: '1'
	end

	# Favouritable routes
	it 'should route PATCH /securities/:security_id/favourite to favourites#update' do
		expect(patch: '/securities/1/favourite').to route_to controller: 'favourites', action: 'update', security_id: '1'
	end

	it 'should route PUT /securities/:security_id/favourite to favourites#update' do
		expect(put: '/securities/1/favourite').to route_to controller: 'favourites', action: 'update', security_id: '1'
	end

	it 'should route DELETE /securities/:security_id/favourite to favourites#destroy' do
		expect(delete: '/securities/1/favourite').to route_to controller: 'favourites', action: 'destroy', security_id: '1'
	end

	it 'should not route GET /securities/:security_id/favourite' do
		expect(get: '/securities/1/favourite').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'securities/1/favourite'
	end
end
