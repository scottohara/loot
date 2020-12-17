# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Flags controller
class FlagsController < ApplicationController
	def update
		transaction = ::Transaction.find(params[:transaction_id])
		if transaction.flag.nil?
			transaction.build_flag(memo: params[:memo])
		else
			transaction.flag.memo = params[:memo]
		end
		transaction.save!
		head :ok
	end

	def destroy
		::Transaction.find(params[:transaction_id]).flag.destroy!
		head :ok
	end
end
