# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Payee cash transaction
class PayeeCashTransaction < CashTransaction
	has_one :header, class_name: 'PayeeTransactionHeader', foreign_key: 'transaction_id', dependent: :destroy, autosave: true

	class << self
		def create_from_json(json)
			s = super
			s.build_header.update_from_json json
			s
		end
	end

	def update_from_json(json)
		super
		header.update_from_json json
		self
	end

	def as_json(options = {})
		super.merge header.as_json
	end
end
