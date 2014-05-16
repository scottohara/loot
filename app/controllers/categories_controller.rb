class CategoriesController < ApplicationController
	respond_to :json

	def index
		if params.has_key? :include_children
			respond_with Category.where(:parent_id => params[:parent]).includes(:parent, :children).order(:direction, :name)
		else
			respond_with Category.where(:parent_id => params[:parent]).order(:direction, :name), :except => [:parent, :children, :num_children]
		end
	end

	def create
		render :json => Category.create(:name => params['name'], :direction => params['direction'], :parent_id => params['parent_id'])
	end

	def update
		category = Category.find params[:id]
		category.update_attributes!(:name => params['name'], :direction => params['direction'], :parent_id => params['parent_id'])
		render :json => category
	end

	def destroy
		Category.find(params[:id]).destroy
		head :status => :ok
	end
end
