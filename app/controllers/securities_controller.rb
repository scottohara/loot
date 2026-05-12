# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Securities controller
class SecuritiesController < ApplicationController
	SHOW_FIELDS = %i[id name closing_balance num_transactions].freeze
	EDIT_FIELDS = %i[id name code favourite closing_balance current_holding num_transactions unused].freeze
	private_constant :SHOW_FIELDS
	private_constant :EDIT_FIELDS

	def index
		if params.key? :include_balances
			render json: ::Security.list
		else
			render json: ::Security.order({favourite: :desc}, :name), only: %i[id name favourite]
		end
	end

	def show
		render json: ::Security.find(params[:id]), only: SHOW_FIELDS
	end

	def create
		render json: ::Security.create!(name: params['name'], code: params['code']), only: EDIT_FIELDS
	end

	def update
		security = ::Security.find params[:id]
		security.update! name: params['name'], code: params['code']
		render json: security, only: EDIT_FIELDS
	end

	def destroy
		::Security.find(params[:id]).destroy!
		head :no_content
	end
end
