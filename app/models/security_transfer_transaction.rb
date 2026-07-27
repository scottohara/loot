# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security transfer transaction
class SecurityTransferTransaction < SecurityTransaction
	include ::Transferable

	validates :amount, absence: true
	validate :validate_quantity_presence, :validate_price_absence, :validate_commission_absence

	after_initialize do |t|
		t.transaction_type = 'SecurityTransfer'
	end

	class << self
		def clear_invalid_attributes(json)
			json['price'] = nil
			json['commission'] = nil
		end
	end

	def as_json(options = {})
		# Super here refers to the Transferrable concern
		super.merge quantity: header.quantity
	end
end
