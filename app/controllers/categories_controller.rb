class CategoriesController < ApplicationController
	def index
		if params.has_key? :include_children
			render json: Category.where(parent_id: params[:parent]).includes(:parent, :children).order(:direction, :name), except: [:closing_balance, :num_transactions]
		else
			render json: Category.where(parent_id: params[:parent]).order({favourite: :desc}, :direction, :name), except: [:parent, :children, :num_children, :closing_balance, :num_transactions]
		end
	end

	def show
		render json: Category.find(params[:id])
	end

	def create
		render json: Category.create(name: params['name'], direction: params['direction'], parent_id: params['parent_id'])
	end

	def update
		category = Category.find params[:id]
		category.update_attributes!(name: params['name'], direction: params['direction'], parent_id: params['parent_id'])
		render json: category
	end

	def destroy
		Category.find(params[:id]).destroy
		head :ok
	end
end
