# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'spec_helper'

describe 'transactions routes', type: :routing do
	# Collection routes
	it 'should route GET /transactions to transactions#index' do
		expect(get: '/transactions').to route_to controller: 'transactions', action: 'index'
	end

	it 'should route POST /transactions to transactions#create' do
		expect(post: '/transactions').to route_to controller: 'transactions', action: 'create'
	end

	# Member routes
	it 'should route GET /transactions/:id to transactions#show' do
		expect(get: '/transactions/1').to route_to controller: 'transactions', action: 'show', id: '1'
	end

	it 'should route PATCH /transactions/:id to transactions#update' do
		expect(patch: '/transactions/1').to route_to controller: 'transactions', action: 'update', id: '1'
	end

	it 'should route PUT /transactions/:id to transactions#update' do
		expect(put: '/transactions/1').to route_to controller: 'transactions', action: 'update', id: '1'
	end

	it 'should route DELETE /transactions/:id to transactions#destroy' do
		expect(delete: '/transactions/1').to route_to controller: 'transactions', action: 'destroy', id: '1'
	end

	it 'should not route GET /transactions/:id/edit' do
		expect(get: '/transactions/1/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'transactions/1/edit'
	end

	# Flaggable routes
	it 'should route PATCH /transactions/:transaction_id/flag to flags#update' do
		expect(patch: '/transactions/1/flag').to route_to controller: 'flags', action: 'update', transaction_id: '1'
	end

	it 'should route PUT /transactions/:transaction_id/flag to flags#update' do
		expect(put: '/transactions/1/flag').to route_to controller: 'flags', action: 'update', transaction_id: '1'
	end

	it 'should route DELETE /transactions/:transaction_id/flag to flags#update' do
		expect(delete: '/transactions/1/flag').to route_to controller: 'flags', action: 'destroy', transaction_id: '1'
	end

	it 'should not route GET /transactions/:transaction_id/flag' do
		expect(get: '/transactions/1/flag').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'transactions/1/flag'
	end

	# Splittable routes
	it 'should route GET /transactions/:transaction_id/subtransactions to subtransactions#index' do
		expect(get: 'transactions/1/subtransactions').to route_to controller: 'subtransactions', action: 'index', transaction_id: '1'
	end

	it 'should not route POST /transactions/:transaction_id/subtransactions' do
		expect(post: '/transactions/1/subtransactions').not_to be_routable
	end

	it 'should not route GET /transactions/:transaction_id/subtransactions/:subtransaction_id' do
		expect(get: '/transactions/1/subtransactions/2').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'transactions/1/subtransactions/2'
	end

	it 'should not route GET /transactions/:transaction_id/subtransactions/:subtransaction_id/edit' do
		expect(get: '/transactions/1/subtransactions/2/edit').to route_to controller: 'application', action: 'routing_error', unmatched_route: 'transactions/1/subtransactions/2/edit'
	end

	it 'should not route PATCH /transactions/:transaction_id/subtransactions/:subtransaction_id' do
		expect(patch: '/transactions/1/subtransactions/2').not_to be_routable
	end

	it 'should not route PUT /transactions/:transaction_id/subtransactions/:subtransaction_id' do
		expect(put: '/transactions/1/subtransactions/2').not_to be_routable
	end

	it 'should not route DELETE /transactions/:transaction_id/subtransactions/:subtransaction_id' do
		expect(delete: '/transactions/1/subtransactions/2').not_to be_routable
	end
end
