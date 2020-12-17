# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security transaction header
class SecurityTransactionHeader < TransactionHeader
	validates :payee_id, absence: true
	belongs_to :security

	def update_from_json(json)
		super
		self.quantity = json['quantity']
		self.price = json['price']
		self.commission = json['commission']
		self.security = ::Security.find_or_new json['security']
		self
	end

	def as_json(options = {})
		super.merge(security: security.as_json)
	end
end
