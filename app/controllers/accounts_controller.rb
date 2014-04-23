class AccountsController < ApplicationController
	respond_to :json

	def index
		if params.has_key? :include_balances
			accounts = Account.account_list
		else
			accounts = Account.all.order(:account_type, :name)
		end

		render :json => accounts
	end

	def show
		respond_with Account.find params[:id]
	end

	def reconcile
		Account.find(params[:id]).reconcile
		head :status => :ok
	end
end
