class TransactionsController < ApplicationController
	respond_to :html, :json

	def index
		@account = Account.find(params[:account_id])
		respond_to do |format|
			format.html do
				@closing_date, @transactions = @account.transaction_ledger (!!params[:as_at] && params[:as_at] || Date.today.to_s)
				@balance = @account.closing_balance @closing_date

				render :layout => "moretransactions" unless params[:as_at].nil?
			end

			format.json do
				opening_balance, transactions = @account.transaction_ledger2 params

				render :json => {
					:openingBalance => opening_balance.to_f,
					:transactions => transactions
				}
			end
		end
	end

end
