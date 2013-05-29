class AccountsController < ApplicationController

	def index
		@asat = params[:asat]
		@accounts = Account.order :name
	end

	def show
		@account = Account.find params[:id]
		@closing_balance = @account.closing_balance Date.parse(params[:asat])
	end

end
