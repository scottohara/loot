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
		# Map param names to models
		contexts = {
			account_id: ::Account,
			payee_id: ::Payee,
			category_id: ::Category,
			security_id: ::Security
		}.with_indifferent_access

		# Get the first pair that matches a param name
		type, id = params.permit(contexts.keys).to_h.first

		# Instantiate the parent resource based on the matched param
		@context = contexts[type].find id
	end
end
