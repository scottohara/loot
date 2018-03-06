# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Favourites controller
class FavouritesController < ApplicationController
	before_action :context

	def update
		update_favourite true
	end

	def destroy
		update_favourite false
	end

	def update_favourite(favourite)
		@context.update!(favourite: favourite)
		head :ok
	end

	def context
		# Instantiate the parent resource based on what params were passed
		@context =
			if params[:account_id]
				Account.find params[:account_id]
			elsif params[:payee_id]
				Payee.find params[:payee_id]
			elsif params[:category_id]
				Category.find params[:category_id]
			elsif params[:security_id]
				Security.find params[:security_id]
			end
	end
end
