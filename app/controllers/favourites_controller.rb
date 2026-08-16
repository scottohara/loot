# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Favourites controller
class FavouritesController < ApplicationController
	include ::Contextable

	before_action :context

	def update
		update_favourite true
	end

	def destroy
		update_favourite false
	end

	private

	def update_favourite(favourite)
		@context.update!(favourite:)
		head :no_content
	end

	def context
		@context = parent_context
	end
end
