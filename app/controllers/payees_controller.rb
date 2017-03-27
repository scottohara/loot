# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Payees controller
class PayeesController < ApplicationController
	def index
		sort = [:name]

		# Only first by favourite for typeaheads
		sort.unshift favourite: :desc unless params.key? :list

		render json: Payee.order(*sort), fields: %i(id name favourite)
	end

	def show
		render json: Payee.find(params[:id])
	end

	def create
		render json: Payee.create!(name: params['name'])
	end

	def update
		payee = Payee.find params[:id]
		payee.update_attributes!(name: params['name'])
		render json: payee
	end

	def destroy
		Payee.find(params[:id]).destroy!
		head :ok
	end
end
