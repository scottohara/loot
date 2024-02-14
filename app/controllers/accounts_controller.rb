# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Accounts controller
class AccountsController < ApplicationController
	def index
		if params.key? :include_balances
			render json: ::Account.list
		else
			render json: ::Account.order({favourite: :desc}, :account_type, :name), fields: %i[id name account_type opening_balance status favourite]
		end
	end

	def show
		render json: ::Account.find(params[:id])
	end

	def create
		render json: ::Account.create_from_json(params)
	end

	def update
		render json: ::Account.update_from_json(params)
	end

	def destroy
		::Account.find(params[:id]).destroy!
		head :ok
	end

	def reconcile
		::Account.find(params[:id]).reconcile
		head :ok
	end
end
