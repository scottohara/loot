class AccountsController < ApplicationController

	def index
		@asat = params[:asat] || Date.today.to_s
		@accounts = Account.order :name
		@closing_balance = {}
		@accounts.each do |account|
			@closing_balance[account[:id]] = account.closing_balance Date.parse(@asat)
		end
	end

	def show
		@account = Account.find params[:id]
		@closing_balance = @account.closing_balance Date.parse(params[:asat])
	end

end
