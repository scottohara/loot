class SecuritiesController < ApplicationController
	respond_to :json

	def index
		if params.has_key? :include_balances
			respond_with Security.list
		else
			respond_with Security.order(:name), :except => [:closing_balance]
		end
	end

	def show
		respond_with Security.find params[:id]
	end

	def create
		render :json => Security.create(:name => params['name'], :code => params['code'])
	end

	def update
		security = Security.find params[:id]
		security.update_attributes!(:name => params['name'], :code => params['code'])
		render :json => security
	end

	def destroy
		Security.find(params[:id]).destroy
		head :status => :ok
	end
end
