class TransactionsController < ApplicationController
	respond_to :json
	before_action :clean, :only => [:create, :update]

	def index
		opening_balance, transactions, at_end = Account.find(params[:account_id]).transaction_ledger params
		render :json => {
			:openingBalance => opening_balance.to_f,
			:transactions => transactions,
			:atEnd => at_end
		}
	end

	def show
		transaction = Transaction.find params[:id]
		render :json => transaction.becomes(Transaction.class_for(transaction.transaction_type))
	end

	def create
		render :json => Transaction.class_for(params['transaction_type']).create_from_json(@transaction)
	end

	def update
		transaction = Transaction.find params[:id]
		if transaction.transaction_type.eql? params['transaction_type']
			# Type hasn't changed, so just update
			render :json => Transaction.class_for(params['transaction_type']).update_from_json(@transaction)
		else
			# Type has changed, so delete and recreate (maintaining previous transaction_id)
			transaction = transaction.becomes Transaction.class_for(transaction.transaction_type)
			transaction.destroy
			create
		end
	end

	def destroy
		transaction = Transaction.find params[:id]
		transaction = transaction.becomes Transaction.class_for(transaction.transaction_type)
		transaction.destroy
		head :status => :ok
	end

	def clean
		# Remove any blank values
		@transaction = params.delete_if do |k,v|
			v.blank?
		end
	end
end
