class SecuritiesController < ApplicationController
	respond_to :json

	def index
		respond_with Security.order(:name)
	end
end
