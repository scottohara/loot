# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::CategoriesController do
	describe 'GET index', :json, :request do
		let(:relation) { instance_double ::ActiveRecord::Relation }

		context 'for category list' do
			let(:json) { 'category list with children' }

			before do
				expect(::Category).to receive(:includes).with(:children).and_return relation
				expect(relation).to receive(:where).with(parent_id: nil).and_return relation
				expect(relation).to receive(:order).with(:direction, :name).and_return json
				get :index, params: {include_children: true}
			end

			it 'should return the category list including children' do
				expect(controller.params).to include :include_children
			end
		end

		context 'for category typeahead' do
			let(:json) { 'category list without children' }

			before do
				expect(::Category).to receive(:where).with(parent_id: '1').and_return relation
				expect(relation).to receive(:order).with({favourite: :desc}, :direction, :name).and_return json
				get :index, params: {parent: '1'}
			end

			it 'should return the category list without children' do
				expect(controller.params).not_to include :include_children
			end
		end
	end

	describe 'GET show', :json, :request do
		let(:category) { instance_double ::Category }
		let(:raw_json) { 'category details' }
		let(:json) { ::JSON.dump raw_json }

		it 'should return the details of the specified category' do
			expect(::Category).to receive(:find).with('1').and_return category
			expect(category).to receive(:as_json).with({only: described_class.const_get(:SHOW_FIELDS)}).and_return raw_json
			get :show, params: {id: '1'}
		end
	end

	describe 'POST create', :json, :request do
		let(:category) { instance_double ::Category }
		let(:parent) { instance_double ::Category }
		let(:name) { 'New category' }
		let(:direction) { 'outflow' }
		let(:request_body) { {name:, direction:, parent_id: '1'} }
		let(:raw_json) { 'created category' }
		let(:json) { ::JSON.dump raw_json }

		context 'with a parent' do
			it 'should create a new child category and return the details' do
				expect(::Category).to receive(:find).with('1').and_return parent
				expect(::Category).to receive(:create!).with({name:, direction:, parent:}).and_return category
				expect(category).to receive(:as_json).with({only: described_class.const_get(:EDIT_FIELDS)}).and_return raw_json
				post :create, params: request_body
			end
		end

		context 'without a parent' do
			it 'should create a new top level category and return the details' do
				expect(::Category).to receive(:create!).with({name:, direction:, parent: nil}).and_return category
				expect(category).to receive(:as_json).with({only: described_class.const_get(:EDIT_FIELDS)}).and_return raw_json
				post :create, params: request_body.except(:parent_id)
			end
		end

		context 'with a non-existent parent' do
			let(:expected_status) { :not_found }
			let(:json) { 'category not found' }

			it 'should return a 404 Not Found status' do
				expect(::Category).to receive(:find).with('1').and_raise ::ActiveRecord::RecordNotFound, json
				post :create, params: request_body
			end
		end
	end

	describe 'PATCH update', :json, :request do
		let(:category) { instance_double ::Category }
		let(:parent) { instance_double ::Category }
		let(:name) { 'Updated category' }
		let(:direction) { 'outflow' }
		let(:request_body) { {name:, direction:, parent_id: '2'} }
		let(:raw_json) { 'updated category' }
		let(:json) { ::JSON.dump raw_json }

		context 'with a parent' do
			it 'should update an existing child category and return the details' do
				expect(::Category).to receive(:find).with('1').and_return category
				expect(::Category).to receive(:find).with('2').and_return parent
				expect(category).to receive(:update!).with({name:, direction:, parent:})
				expect(category).to receive(:as_json).with({only: described_class.const_get(:EDIT_FIELDS)}).and_return raw_json
				patch :update, params: request_body.merge(id: '1')
			end
		end

		context 'without a parent' do
			it 'should update an existing top level category and return the details' do
				expect(::Category).to receive(:find).with('1').and_return category
				expect(category).to receive(:update!).with({name:, direction:, parent: nil})
				expect(category).to receive(:as_json).with({only: described_class.const_get(:EDIT_FIELDS)}).and_return raw_json
				patch :update, params: request_body.except(:parent_id).merge(id: '1')
			end
		end

		context 'with a non-existent parent' do
			let(:expected_status) { :not_found }
			let(:json) { 'category not found' }

			it 'should return a 404 Not Found status' do
				expect(::Category).to receive(:find).with('1').and_return category
				expect(::Category).to receive(:find).with('2').and_raise ::ActiveRecord::RecordNotFound, json
				patch :update, params: request_body.merge(id: '1')
			end
		end
	end

	describe 'DELETE destroy', :request do
		let(:category) { ::Category.new }
		let(:expected_status) { :no_content }

		it 'should delete an existing category' do
			expect(::Category).to receive(:find).with('1').and_return category
			expect(category).to receive :destroy!
			delete :destroy, params: {id: '1'}
		end
	end
end
