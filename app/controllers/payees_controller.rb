class PayeesController < ApplicationController

	def index
		@payees = Payee.order(:name)
	end

end
