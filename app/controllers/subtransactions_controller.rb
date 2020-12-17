# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Subtransactions controller
class SubtransactionsController < ApplicationController
	def index
		render json: ::SplitTransaction.find(params[:transaction_id]).children
	end
end
