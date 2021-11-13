# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::CategoriesController, type: :controller do
	describe 'GET index', request: true, json: true do
		context 'for category list' do
			let(:json) { 'category list with children' }

			before do
				expect(::Category).to receive_message_chain(:where, :includes, :order).with(:direction, :name).and_return json
				get :index, params: {include_children: true}
			end

			it 'should return the category list including children' do
				expect(controller.params).to include :include_children
			end
		end

		context 'for category typeahead' do
			let(:json) { 'category list without children' }

			before do
				expect(::Category).to receive_message_chain(:where, :order).with({favourite: :desc}, :direction, :name).and_return json
				get :index
			end

			it 'should return the category list without children' do
				expect(controller.params).not_to include :include_children
			end
		end
	end

	describe 'GET show', request: true, json: true do
		let(:json) { 'category details' }

		it 'should return the details of the specified category' do
			expect(::Category).to receive(:find).with('1').and_return json
			get :show, params: {id: '1'}
		end
	end

	describe 'POST create', request: true, json: true do
		let(:request_body) { {name: 'New category', direction: 'outflow', parent_id: '1'} }
		let(:json) { 'created category' }

		it 'should create a new category and return the details' do
			expect(::Category).to receive(:create!).with(request_body).and_return json
			post :create, params: request_body
		end
	end

	describe 'PATCH update', request: true, json: true do
		let(:category) { instance_double 'category' }
		let(:request_body) { {name: 'Updated category', direction: 'outflow', parent_id: '1'} }
		let(:raw_json) { 'updated category' }
		let(:json) { ::JSON.dump raw_json }

		it 'should update an existing category and return the details' do
			expect(::Category).to receive(:find).with('1').and_return category
			expect(category).to receive(:update!).with request_body
			expect(category).to receive(:as_json).and_return raw_json
			patch :update, params: request_body.merge(id: '1')
		end
	end

	describe 'DELETE destroy', request: true do
		let(:category) { ::Category.new }

		it 'should delete an existing category' do
			expect(::Category).to receive(:find).with('1').and_return category
			expect(category).to receive :destroy!
			delete :destroy, params: {id: '1'}
		end
	end
end
