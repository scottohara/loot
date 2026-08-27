# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Dividend transaction
class DividendTransaction < SecurityCashTransaction
	validate :validate_quantity_absence, :validate_price_absence, :validate_commission_absence
	after_initialize do |t|
		t.transaction_type = 'Dividend'
	end

	class << self
		def create_from_json(json)
			# Remove quantity, price and commission if present
			json = json.except 'quantity', 'price', 'commission'

			s = super
			s.amount = json['amount']
			s.transaction_accounts.build(direction: 'outflow', status: json['status']).account = ::Account.find_from_json json['primary_account']
			s.transaction_accounts.build(direction: 'inflow', status: json['related_status']).account = ::Account.find_from_json json['account']
			s.save!
			s
		end
	end

	def update_from_json(json)
		super
		self.amount = json['amount']
		investment_account.account = ::Account.find_from_json json['primary_account']
		cash_account.account = ::Account.find_from_json json['account']
		save!
	end
end
