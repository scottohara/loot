# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Payee transaction header
class PayeeTransactionHeader < TransactionHeader
	validates :security_id, :quantity, :commission, :price, absence: true
	belongs_to :payee

	def update_from_json(json)
		super
		self.payee = Payee.find_or_new json['payee']
		self
	end

	def as_json(options = {})
		super.merge payee: payee.as_json
	end
end
