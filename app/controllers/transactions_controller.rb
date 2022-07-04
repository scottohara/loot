# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Transactions controller
class TransactionsController < ApplicationController
	before_action :clean, only: %i[create update]
	before_action :context, only: %i[index last]

	def index
		opening_balance, transactions, at_end = @context.ledger params
		render json: {
			openingBalance: opening_balance.to_f,
			transactions:,
			atEnd: at_end
		}
	end

	def show
		render json: ::Transaction.find(params[:id]).as_subclass
	end

	def create
		render json: create_transaction
	end

	def update
		transaction = ::Transaction.find params[:id]
		if transaction.transaction_type.eql? params['transaction_type']
			# Type hasn't changed, so just update
			render json: ::Transaction.class_for(params['transaction_type']).update_from_json(@transaction)
		else
			# Type has changed, so delete and recreate (maintaining previous transaction_id)
			transaction.as_subclass.destroy!
			render json: create_transaction
		end
	end

	def destroy
		::Transaction.find(params[:id]).as_subclass.destroy!
		head :ok
	end

	def last
		transaction = @context.transactions.where(transaction_type: ::Transaction.types_for(params[:account_type])).last&.as_subclass
		if transaction.nil?
			head :not_found
		else
			render json: transaction
		end
	end

	def clean
		# Remove any blank values
		@transaction = params.compact_blank
	end

	def context
		# Instantiate the parent resource based on what params were passed
		@context =
			if params[:account_id]
				::Account.find params[:account_id]
			elsif params[:payee_id]
				::Payee.find params[:payee_id]
			elsif params[:category_id]
				::Category.find params[:category_id]
			elsif params[:security_id]
				::Security.find params[:security_id]
			else
				::Transaction
			end
	end

	def create_transaction
		::Transaction.class_for(params['transaction_type']).create_from_json @transaction
	end
end
