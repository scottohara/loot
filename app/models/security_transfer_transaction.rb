# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security transfer transaction
class SecurityTransferTransaction < SecurityTransaction
	include ::Transferable

	validates :amount, absence: true
	validates :quantity, presence: true
	validates :price, :commission, absence: true

	after_initialize do |t|
		t.transaction_type = 'SecurityTransfer'
	end

	class << self
		def strip_invalid_attributes(json)
			json.except 'price', 'commission'
		end
	end

	def as_json(options = {})
		# Super here refers to the Transferrable concern
		super.merge quantity: header.quantity
	end
end
