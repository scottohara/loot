class LoginsController < ApplicationController
	respond_to :json

	def create
		render :nothing => true, :status => :created
	end
end
