# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Contextable
module Contextable
	extend ::ActiveSupport::Concern

	# Map path param names to models
	CONTEXTS = {
		account_id: ::Account,
		payee_id: ::Payee,
		category_id: ::Category,
		security_id: ::Security
	}.freeze

	private_constant :CONTEXTS

	private

	def parent_context
		# Get the first pair that matches a param name
		type, id = request.path_parameters.slice(*CONTEXTS.keys).first

		type && CONTEXTS[type].find(id)
	end
end
