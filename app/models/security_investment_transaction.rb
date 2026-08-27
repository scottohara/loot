# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security investment transaction
class SecurityInvestmentTransaction < SecurityCashTransaction
	validate :validate_quantity_presence, :validate_price_presence, :validate_commission_presence
	validate :validate_amount_matches_investment_details
	after_initialize do |t|
		t.transaction_type = 'SecurityInvestment'
	end

	class << self
		def create_from_json(json)
			cash_direction = (json['direction'].eql?('inflow') && 'outflow') || 'inflow'

			s = super
			s.amount = json['amount']
			s.transaction_accounts.build(direction: json['direction'], status: json['status']).account = ::Account.find_from_json json['primary_account']
			s.transaction_accounts.build(direction: cash_direction, status: json['related_status']).account = ::Account.find_from_json json['account']
			s.save!
			s.header.security.update_price! json['price'], json['transaction_date'], json[:id] unless json['transaction_date'].nil?
			s
		end
	end

	def update_from_json(json)
		cash_direction = (json['direction'].eql?('inflow') && 'outflow') || 'inflow'

		super
		self.amount = json['amount']
		investment_account.direction = json['direction']
		investment_account.account = ::Account.find_from_json json['primary_account']
		cash_account.direction = cash_direction
		cash_account.account = ::Account.find_from_json json['account']
		save!
		header.security.update_price! json['price'], json['transaction_date'], json[:id] unless json['transaction_date'].nil?
	end

	def as_json(options = {})
		super.merge quantity: header.quantity,
			price: header.price,
			commission: header.commission
	end

	# :nocov:

	private unless ::Rails.env.test?

	# :nocov:end

	def validate_amount_matches_investment_details
		return if [amount, header.price, header.quantity, header.commission, investment_account].any?(&:nil?)

		errors.add :base, "Amount must equal price times quantity #{investment_account.direction.eql?('inflow') ? 'plus' : 'less'} commission" unless amount.round(2).eql?(((header.price * header.quantity) + (header.commission * (investment_account.direction.eql?('inflow') ? 1 : -1))).round 2)
	end
end
