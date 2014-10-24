class SubtransactionsController < ApplicationController
	respond_to :json

	def index
		respond_with SplitTransaction.find(params[:transaction_id]).children
	end
end
