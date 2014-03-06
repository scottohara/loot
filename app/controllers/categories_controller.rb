class CategoriesController < ApplicationController
	respond_to :html, :json

	def index
		@categories = Category.where(:parent_id => params[:parent]).includes(:children).order(:direction, :name)
		respond_with @categories
	end

end
