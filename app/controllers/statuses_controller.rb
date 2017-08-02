# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Statuses controller
class StatusesController < ApplicationController
	def update
		status = params.keys.keep_if { |key| %w[Cleared Reconciled].include? key }.first
		update_status status
	end

	def destroy
		update_status
	end

	def update_status(status = nil)
		TransactionAccount
			.where(account_id: params[:account_id])
			.where(transaction_id: params[:transaction_id])
			.update_all(status: status)

		head :ok
	end
end
