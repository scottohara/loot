class CategoriesController < ApplicationController

	def index
		@categories = Category.where(:parent_id => nil).includes(:children).order(:direction, :name)
	end

end
