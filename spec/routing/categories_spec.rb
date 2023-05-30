# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'spec_helper'

describe 'categories routes' do
	# Collection routes
	it 'should route GET /categories to categories#index' do
		expect(get: '/categories').to route_to controller: 'categories', action: 'index'
	end

	it 'should route POST /categories to categories#create' do
		expect(post: '/categories').to route_to controller: 'categories', action: 'create'
	end

	# Member routes
	it 'should route GET /categories/:id to categories#show' do
		expect(get: '/categories/1').to route_to controller: 'categories', action: 'show', id: '1'
	end

	it 'should route PATCH /categories/:id to categories#update' do
		expect(patch: '/categories/1').to route_to controller: 'categories', action: 'update', id: '1'
	end

	it 'should route PUT /categories/:id to categories#update' do
		expect(put: '/categories/1').to route_to controller: 'categories', action: 'update', id: '1'
	end

	it 'should route DELETE /categories/:id to categories#destroy' do
		expect(delete: '/categories/1').to route_to controller: 'categories', action: 'destroy', id: '1'
	end

	it 'should not route GET /categories/:id/edit' do
		expect(get: '/categories/1/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'categories/1/edit'
	end

	# Transactions collection routes
	it 'should route GET /categories/:category_id/transactions to transactions#index' do
		expect(get: '/categories/1/transactions').to route_to controller: 'transactions', action: 'index', category_id: '1'
	end

	it 'should not route GET /categories/:category_id/transactions/new' do
		expect(get: '/categories/1/transactions/new').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'categories/1/transactions/new'
	end

	# Transactions member routes
	it 'should not route GET /categories/:category_id/transactions/:id' do
		expect(get: '/categories/1/transactions/2').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'categories/1/transactions/2'
	end

	it 'should not route GET /categories/:category_id/transactions/:id/edit' do
		expect(get: '/categories/1/transactions/2/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'categories/1/transactions/2/edit'
	end

	it 'should not route PATCH /categories/:category_id/transactions/:id' do
		expect(patch: '/categories/1/transactions/2').not_to be_routable
	end

	it 'should not route PUT /categories/:category_id/transactions/:id' do
		expect(put: '/categories/1/transactions/2').not_to be_routable
	end

	it 'should not route DELETE /categories/:category_id/transactions/:id' do
		expect(delete: '/categories/1/transactions/2').not_to be_routable
	end

	# Defaultable routes
	it 'should route GET /categories/:category_id/transactions/last to transactions#last' do
		expect(get: '/categories/1/transactions/last').to route_to controller: 'transactions', action: 'last', category_id: '1'
	end

	# Favouritable routes
	it 'should route PATCH /categories/:category_id/favourite to favourites#update' do
		expect(patch: '/categories/1/favourite').to route_to controller: 'favourites', action: 'update', category_id: '1'
	end

	it 'should route PUT /categories/:category_id/favourite to favourites#update' do
		expect(put: '/categories/1/favourite').to route_to controller: 'favourites', action: 'update', category_id: '1'
	end

	it 'should route DELETE /categories/:category_id/favourite to favourites#destroy' do
		expect(delete: '/categories/1/favourite').to route_to controller: 'favourites', action: 'destroy', category_id: '1'
	end

	it 'should not route GET /categories/:category_id/favourite' do
		expect(get: '/categories/1/favourite').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'categories/1/favourite'
	end
end
