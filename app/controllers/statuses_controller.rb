# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Statuses controller
class StatusesController < ApplicationController
	def update
		status = params.keys.find { %w[Cleared Reconciled].include? it }

		return head :bad_request if status.nil?

		update_status status
	end

	def destroy
		update_status
	end

	private

	def update_status(status = nil)
		::TransactionAccount
			.find_by!(account_id: params[:account_id], transaction_id: params[:transaction_id])
			.update!(status:)

		head :no_content
	end
end
