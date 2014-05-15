class PayeesController < ApplicationController
	respond_to :json

	def index
		respond_with Payee.order(:name)
	end

	def create
		render :json => Payee.create(:name => params['name'])
	end

	def update
		payee = Payee.find params[:id]
		payee.update_attributes!(:name => params['name'])
		render :json => payee
	end

	def destroy
		Payee.find(params[:id]).destroy
		head :status => :ok
	end
end
