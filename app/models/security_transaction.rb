# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security transaction
class SecurityTransaction < Transaction
	has_one :header, class_name: 'SecurityTransactionHeader', foreign_key: 'transaction_id', dependent: :destroy, autosave: true
	delegate :quantity, :price, :commission, to: :header, allow_nil: true

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
