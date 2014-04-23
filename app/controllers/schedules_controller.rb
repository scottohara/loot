class SchedulesController < ApplicationController
	respond_to :json
	before_action :clean, :only => [:create, :update]

	def index
		respond_with Schedule.ledger
	end

	def create
		render :json => Transaction.class_for(params['transaction_type']).create_from_json(@schedule)
	end

	def update
		schedule = Transaction.find params[:id]
		if schedule.transaction_type.eql? params['transaction_type']
			# Type hasn't changed, so just update
			render :json => Transaction.class_for(params['transaction_type']).update_from_json(@schedule)
		else
			# Type has changed, so delete and recreate (maintaining previous transaction_id)
			schedule = schedule.becomes Transaction.class_for(schedule.transaction_type)
			schedule.destroy
			create
		end
	end

	def destroy
		schedule = Transaction.find params[:id]
		schedule = schedule.becomes Transaction.class_for(schedule.transaction_type)
		schedule.destroy
		head :status => :ok
	end

	def clean
		# Remove any blank values
		@schedule = params.delete_if do |k,v|
			v.blank?
		end

		# Ensure that transaction date is nil
		@schedule['transaction_date'] = nil

		# Copy the schedule_account.id to account_id
		@schedule['account_id'] = @schedule['schedule_account']['id']
	end
end
