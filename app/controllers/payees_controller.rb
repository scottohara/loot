class PayeesController < ApplicationController
	respond_to :html, :json

	def index
		@payees = Payee.order(:name)
		respond_with @payees
	end

end
