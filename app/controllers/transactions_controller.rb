class TransactionsController < ApplicationController
	before_action :clean, only: [:create, :update]
	before_action :context, only: [:index, :last]

	def index
		opening_balance, transactions, at_end = @context.ledger params
		render json: {
			openingBalance: opening_balance.to_f,
			transactions: transactions,
			atEnd: at_end
		}
	end

	def show
		render json: Transaction.find(params[:id]).as_subclass
	end

	def create
		render json: create_transaction
	end

	def update
		transaction = Transaction.find params[:id]
		if transaction.transaction_type.eql? params['transaction_type']
			# Type hasn't changed, so just update
			render json: Transaction.class_for(params['transaction_type']).update_from_json(@transaction)
		else
			# Type has changed, so delete and recreate (maintaining previous transaction_id)
			transaction.as_subclass.destroy
			render json: create_transaction
		end
	end

	def destroy
		Transaction.find(params[:id]).as_subclass.destroy
		head :ok
	end

	def last
		render json: @context.transactions.where(transaction_type: Transaction.types_for(params[:account_type])).last.as_subclass
	end

	def clean
		# Remove any blank values
		@transaction = params.delete_if do |k,v|
			v.blank?
		end
	end

	def context
		# Instantiate the parent resource based on what params were passed
		@context = case
			when params[:account_id] then Account.find(params[:account_id])
			when params[:payee_id] then Payee.find(params[:payee_id])
			when params[:category_id] then Category.find(params[:category_id])
			when params[:security_id] then Security.find(params[:security_id])
			else Transaction
		end
	end

	def create_transaction
		Transaction.class_for(params['transaction_type']).create_from_json(@transaction)
	end
end
