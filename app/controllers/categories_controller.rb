# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Categories controller
class CategoriesController < ApplicationController
	SHOW_FIELDS = %i[id name direction parent_id parent closing_balance num_transactions].freeze
	EDIT_FIELDS = %i[id name direction parent_id favourite parent num_children].freeze
	private_constant :SHOW_FIELDS
	private_constant :EDIT_FIELDS

	def index
		if params.key? :include_children
			render json: ::Category.where(parent_id: params[:parent]).includes(:parent, :children).order(:direction, :name), only: %i[id name direction parent_id num_children parent num_transactions favourite children]
		else
			render json: ::Category.where(parent_id: params[:parent]).order({favourite: :desc}, :direction, :name)
		end
	end

	def show
		render json: ::Category.find(params[:id]), only: SHOW_FIELDS
	end

	def create
		render json: ::Category.create!(name: params['name'], direction: params['direction'], parent_id: params['parent_id']), only: EDIT_FIELDS
	end

	def update
		category = ::Category.find params[:id]
		category.update! name: params['name'], direction: params['direction'], parent_id: params['parent_id']
		render json: category, only: EDIT_FIELDS
	end

	def destroy
		::Category.find(params[:id]).destroy!
		head :no_content
	end
end
