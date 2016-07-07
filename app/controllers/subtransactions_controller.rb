class SubtransactionsController < ApplicationController
	def index
		render json: SplitTransaction.find(params[:transaction_id]).children
	end
end
