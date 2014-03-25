class PayeesController < ApplicationController
	respond_to :json

	def index
		respond_with Payee.order(:name)
	end
end
