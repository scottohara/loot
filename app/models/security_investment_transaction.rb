# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security investment transaction
class SecurityInvestmentTransaction < SecurityTransaction
	validates :amount, presence: true
	validate :validate_quantity_presence, :validate_price_presence, :validate_commission_presence
	validate :validate_amount_matches_investment_details
	has_many :transaction_accounts, foreign_key: 'transaction_id', autosave: true, dependent: :destroy
	has_many :accounts, through: :transaction_accounts
	after_initialize do |t|
		t.transaction_type = 'SecurityInvestment'
	end

	class << self
		def create_from_json(json)
			cash_direction = json['direction'].eql?('inflow') && 'outflow' || 'inflow'

			s = super
			s.amount = json['amount']
			s.transaction_accounts.build(direction: json['direction'], status: json['status']).account = Account.find json['primary_account']['id']
			s.transaction_accounts.build(direction: cash_direction, status: json['related_status']).account = Account.find json['account']['id']
			s.save!
			s.header.security.update_price! json['price'], json['transaction_date'], json[:id] unless json['transaction_date'].nil?
			s
		end

		def update_from_json(json)
			s = includes(:header, :accounts).find json[:id]
			s.update_from_json json
			s
		end
	end

	def validate_amount_matches_investment_details
		errors[:base] << "Amount must equal price times quantity #{investment_account.direction.eql?('inflow') ? 'plus' : 'less'} commission" unless amount.round(2).eql?((header.price * header.quantity + header.commission * (investment_account.direction.eql?('inflow') ? 1 : -1)).round 2)
	end

	def update_from_json(json)
		cash_direction = json['direction'].eql?('inflow') && 'outflow' || 'inflow'

		super
		self.amount = json['amount']
		investment_account.direction = json['direction']
		investment_account.account = Account.find json['primary_account']['id']
		cash_account.direction = cash_direction
		cash_account.account = Account.find json['account']['id']
		save!
		header.security.update_price! json['price'], json['transaction_date'], json[:id] unless json['transaction_date'].nil?
	end

	def as_json(options = {})
		primary_account = investment_account
		other_account = cash_account
		primary_account, other_account = other_account, primary_account if options[:primary_account].eql? other_account.account_id

		super.merge(
			primary_account: primary_account.account.as_json,
			category: self.class.transaction_category({'transaction_type' => transaction_type, 'direction' => primary_account.direction}, primary_account.account.account_type),
			account: other_account.account.as_json,
			amount: amount,
			direction: primary_account.direction,
			status: primary_account.status,
			related_status: other_account.status,
			quantity: header.quantity,
			price: header.price,
			commission: header.commission
		)
	end

	def investment_account
		transaction_accounts.select { |trx_account| trx_account.account.account_type.eql? 'investment' }.first
	end

	def cash_account
		transaction_accounts.select { |trx_account| trx_account.account.account_type.eql? 'bank' }.first
	end
end
