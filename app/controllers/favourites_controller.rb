class FavouritesController < ApplicationController
	before_action :context

	def update
		update_favourite true
	end

	def destroy
		update_favourite false
	end

	def update_favourite(favourite)
		@context.update_attributes!(favourite: favourite)
		head :ok
	end

	def context
		# Instantiate the parent resource based on what params were passed
		@context = case
			when params[:account_id] then Account.find(params[:account_id])
			when params[:payee_id] then Payee.find(params[:payee_id])
			when params[:category_id] then Category.find(params[:category_id])
			when params[:security_id] then Security.find(params[:security_id])
		end
	end
end
