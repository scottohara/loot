class AccountsController < ApplicationController
	respond_to :json

	def index
		if params.has_key? :include_balances
			respond_with Account.list
		else
			respond_with Account.all.order({favourite: :desc}, :account_type, :name), except: [:closing_balance, :num_transactions, :related_account]
		end
	end

	def show
		respond_with Account.find params[:id]
	end

	def create
		render json: Account.create_from_json(params)
	end

	def update
		render json: Account.update_from_json(params)
	end

	def destroy
		account = Account.includes(:related_account).find(params[:id])

		# For investment accounts, remove the associated cash account
		account.related_account.destroy if account.account_type.eql?("investment") and !!account.related_account

		account.destroy
		head status: :ok
	end

	def reconcile
		Account.find(params[:id]).reconcile
		head status: :ok
	end
end
