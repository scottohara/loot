class SubtransactionsController < ApplicationController
	respond_to :json

	def index
		trx = SplitTransaction.find(params[:transaction_id])
		respond_with trx.children
	end

end
