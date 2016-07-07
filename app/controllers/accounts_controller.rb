class AccountsController < ApplicationController
	def index
		if params.has_key? :include_balances
			render json: Account.list
		else
			render json: Account.all.order({favourite: :desc}, :account_type, :name), except: [:closing_balance, :num_transactions, :related_account]
		end
	end

	def show
		render json: Account.find(params[:id])
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
		head :ok
	end

	def reconcile
		Account.find(params[:id]).reconcile
		head :ok
	end
end
