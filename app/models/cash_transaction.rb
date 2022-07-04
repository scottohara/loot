# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Cash transaction
class CashTransaction < Transaction
	validates :amount, presence: true

	class << self
		def create_from_json(json)
			s = super
			s.amount = json['amount']
			s
		end
	end

	def update_from_json(json)
		super
		self.amount = json['amount']
		self
	end

	def as_json(options = {})
		super.merge(amount:)
	end
end
