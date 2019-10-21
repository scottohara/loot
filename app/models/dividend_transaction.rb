# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Dividend transaction
class DividendTransaction < SecurityTransaction
	validates :amount, presence: true
	validate :validate_quantity_absence, :validate_price_absence, :validate_commission_absence
	has_many :transaction_accounts, foreign_key: 'transaction_id', autosave: true, dependent: :destroy
	has_many :accounts, through: :transaction_accounts
	after_initialize do |t|
		t.transaction_type = 'Dividend'
	end

	class << self
		def create_from_json(json)
			# Make sure quantity, price and commission are nil
			json['quantity'] = nil
			json['price'] = nil
			json['commission'] = nil

			s = super
			s.amount = json['amount']
			s.transaction_accounts.build(direction: 'outflow', status: json['status']).account = Account.find json['primary_account']['id']
			s.transaction_accounts.build(direction: 'inflow', status: json['related_status']).account = Account.find json['account']['id']
			s.save!
			s
		end

		def update_from_json(json)
			s = includes(:header, :accounts).find json[:id]
			s.update_from_json json
			s
		end
	end

	def update_from_json(json)
		super
		self.amount = json['amount']
		investment_account.account = Account.find json['primary_account']['id']
		cash_account.account = Account.find json['account']['id']
		save!
	end

	def as_json(options = {})
		primary_account = investment_account
		other_account = cash_account
		primary_account, other_account = other_account, primary_account if options[:primary_account].eql? other_account.account_id

		super.merge(
			primary_account: primary_account.account.as_json,
			category: self.class.transaction_category('transaction_type' => transaction_type, 'direction' => primary_account.direction),
			account: other_account.account.as_json,
			amount: amount,
			direction: primary_account.direction,
			status: primary_account.status,
			related_status: other_account.status
		)
	end

	def investment_account
		transaction_accounts.find { |trx_account| trx_account.account.account_type.eql? 'investment' }
	end

	def cash_account
		transaction_accounts.find { |trx_account| trx_account.account.account_type.eql? 'bank' }
	end
end
