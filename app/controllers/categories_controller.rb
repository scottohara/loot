class CategoriesController < ApplicationController
	respond_to :json

	def index
		respond_with Category.where(:parent_id => params[:parent]).includes(:children).order(:direction, :name)
	end
end
