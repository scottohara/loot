class SecuritiesController < ApplicationController
	respond_to :json

	def index
		render :json => if params.has_key? :include_balances
			Security.list
		else
			Security.order(:name)
		end
	end
end
