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
			schedule.as_subclass.destroy
			create
		end
	end

	def destroy
		Transaction.find(params[:id]).as_subclass.destroy
		head :status => :ok
	end

	def clean
		# Remove any blank values
		@schedule = params.delete_if do |k,v|
			v.blank?
		end

		# Ensure that transaction date is nil
		@schedule['transaction_date'] = nil

		# Copy the primary_account.id to account_id
		@schedule['account_id'] = @schedule['primary_account']['id']
	end
end
