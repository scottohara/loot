# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Accounts controller
class AccountsController < ApplicationController
	SHOW_FIELDS = %i[id name account_type closing_balance cleared_closing_balance reconciled_closing_balance num_transactions].freeze
	EDIT_FIELDS = %i[id name account_type opening_balance status favourite closing_balance related_account].freeze
	private_constant :SHOW_FIELDS
	private_constant :EDIT_FIELDS

	def index
		if params.key? :include_balances
			render json: ::Account.list
		else
			render json: ::Account.order({favourite: :desc}, :account_type, :name), only: %i[id name account_type opening_balance status favourite]
		end
	end

	def show
		render json: ::Account.find(params[:id]), only: SHOW_FIELDS
	end

	def create
		render json: ::Account.create_from_json(params), only: EDIT_FIELDS
	end

	def update
		render json: ::Account.update_from_json(params), only: EDIT_FIELDS
	end

	def destroy
		::Account.find(params[:id]).destroy!
		head :no_content
	end

	def reconcile
		::Account.find(params[:id]).reconcile
		head :no_content
	end
end
