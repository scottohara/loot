# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Securities controller
class SecuritiesController < ApplicationController
	def index
		if params.key? :include_balances
			render json: Security.list
		else
			render json: Security.order({favourite: :desc}, :name), fields: %i[id name code favourite]
		end
	end

	def show
		render json: Security.find(params[:id])
	end

	def create
		render json: Security.create!(name: params['name'], code: params['code'])
	end

	def update
		security = Security.find params[:id]
		security.update!(name: params['name'], code: params['code'])
		render json: security
	end

	def destroy
		Security.find(params[:id]).destroy!
		head :ok
	end
end
