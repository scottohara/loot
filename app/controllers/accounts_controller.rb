class AccountsController < ApplicationController
	respond_to :json

	def index
		if params.has_key? :include_balances
			respond_with Account.list
		else
			respond_with Account.all.order(:account_type, :name), except: [:closing_balance, :num_transactions]
		end
	end

	def show
		respond_with Account.find params[:id]
	end

	def reconcile
		Account.find(params[:id]).reconcile
		head status: :ok
	end
end
