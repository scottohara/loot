# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Schedules controller
class SchedulesController < ApplicationController
	before_action :clean, only: %i(create update)

	def index
		render json: Schedule.ledger
	end

	def create
		render json: create_schedule
	end

	def update
		schedule = Transaction.find params[:id]
		if schedule.transaction_type.eql? params['transaction_type']
			# Type hasn't changed, so just update
			render json: Transaction.class_for(params['transaction_type']).update_from_json(@schedule)
		else
			# Type has changed, so delete and recreate (maintaining previous transaction_id)
			schedule.as_subclass.destroy!
			render json: create_schedule
		end
	end

	def destroy
		Transaction.find(params[:id]).as_subclass.destroy!
		head :ok
	end

	def clean
		# Remove any blank values
		@schedule = params.delete_if { |_k, v| v.blank? }

		# Ensure that transaction date is nil
		@schedule['transaction_date'] = nil

		# Copy the primary_account.id to account_id
		@schedule['account_id'] = @schedule['primary_account']['id']
	end

	def create_schedule
		Transaction.class_for(params['transaction_type']).create_from_json(@schedule)
	end
end
