class AccountsController < ApplicationController
	def index
		respond_to do |format|
			format.html { @accounts = Account.account_list }
			format.json { render :json => Account.all.order(:account_type, :name) }
		end
	end

end
