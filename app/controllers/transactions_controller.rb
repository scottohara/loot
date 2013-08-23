class TransactionsController < ApplicationController

	def index
		@transactions = Account.find(params[:account_id]).transaction_ledger Date.parse(params[:asat])
	end

end
