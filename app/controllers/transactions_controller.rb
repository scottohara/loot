# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Transactions controller
class TransactionsController < ApplicationController
	include ::Contextable

	before_action :clean, only: %i[create update]
	before_action :context, only: %i[index last]
	before_action :require_query, only: :index
	before_action :klass, only: %i[create update]

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
			render json: @klass.update_from_json(@transaction)
		else
			# Type has changed, so delete and recreate (maintaining previous transaction_id)
			transaction.as_subclass.destroy!
			strip_invalid_attributes
			render json: create_transaction
		end
	end

	def destroy
		::Transaction.find(params[:id]).as_subclass.destroy!
		head :no_content
	end

	def last
		transaction = @context.transactions.where(transaction_type: ::Transaction.types_for(params[:account_type])).last&.as_subclass
		if transaction.nil?
			head :not_found
		else
			render json: transaction
		end
	end

	# :nocov:

	private unless ::Rails.env.test?

	# :nocov:end

	def clean
		# Remove any blank values
		@transaction = params.compact_blank
	end

	def context
		@context = parent_context || ::Transaction
	end

	def require_query
		head :bad_request if @context.eql?(::Transaction) && params[:query].blank?
	end

	def klass
		@klass = ::Transaction.class_for params['transaction_type']
	end

	def strip_invalid_attributes
		# Strip any attributes that don't apply to the new type but were carried
		# over from the old one (e.g. price/commission when converting to a transfer)
		@transaction = @klass.strip_invalid_attributes @transaction if @klass.respond_to? :strip_invalid_attributes
	end

	def create_transaction
		@klass.create_from_json @transaction
	end
end
