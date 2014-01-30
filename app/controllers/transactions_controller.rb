class TransactionsController < ApplicationController

	def index
		if params[:start]
			@transactions = Account.find(params[:account_id]).transaction_ledger Date.parse(params[:asat]), Date.parse(params[:start])
		else
			@transactions = Account.find(params[:account_id]).transaction_ledger Date.parse(params[:asat])
		end
	end

end
