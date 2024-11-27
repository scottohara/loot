# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Flags controller
class FlagsController < ApplicationController
	def update
		transaction = ::Transaction.find(params[:transaction_id])
		if transaction.flag.nil?
			transaction.build_flag(flag_type: params[:flag_type], memo: params[:memo])
			transaction.save!
		else
			transaction.flag.update!(flag_type: params[:flag_type], memo: params[:memo])
		end
		head :no_content
	end

	def destroy
		::Transaction.find(params[:transaction_id]).flag.destroy!
		head :no_content
	end
end
