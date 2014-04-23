class StatusesController < ApplicationController

	def update
		status = params.keys.keep_if {|status| %w(pending cleared).include? status }.first
		update_status status
	end

	def destroy
		update_status
	end

	def update_status(status = nil)
		TransactionHeader.find(params[:transaction_id]).update_attributes(:status => status)
		head :status => :ok
	end
end
