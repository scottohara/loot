# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Schedules controller
class SchedulesController < ApplicationController
	before_action :clean, only: %i[create update]
	before_action :klass, only: %i[create update]

	def index
		render json: ::Schedule.ledger
	end

	def create
		render json: create_schedule
	end

	def update
		schedule = ::Transaction.find params[:id]
		if schedule.transaction_type.eql? params['transaction_type']
			# Type hasn't changed, so just update
			render json: @klass.update_from_json(@schedule)
		else
			# Type has changed, so delete and recreate (maintaining previous transaction_id)
			schedule.as_subclass.destroy!
			strip_invalid_attributes
			render json: create_schedule
		end
	end

	def destroy
		::Transaction.find(params[:id]).as_subclass.destroy!
		head :no_content
	end

	# :nocov:

	private unless ::Rails.env.test?

	# :nocov:end

	def clean
		# Remove any blank values
		@schedule = params.compact_blank

		# Ensure that transaction date is nil
		@schedule['transaction_date'] = nil

		# Copy the primary_account.id to account_id
		@schedule['account_id'] = @schedule.fetch('primary_account', nil)['id']
	end

	def klass
		@klass = ::Transaction.class_for params['transaction_type']
	end

	def strip_invalid_attributes
		# Strip any attributes that don't apply to the new type but were carried
		# over from the old one (e.g. price/commission when converting to a transfer)
		@schedule = @klass.strip_invalid_attributes @schedule if @klass.respond_to? :strip_invalid_attributes
	end

	def create_schedule
		@klass.create_from_json @schedule
	end
end
