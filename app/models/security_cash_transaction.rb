# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security cash transaction
class SecurityCashTransaction < SecurityTransaction
	validates :amount, presence: true
	validate :validate_cash_account_type
	has_many :transaction_accounts, foreign_key: 'transaction_id', autosave: true, dependent: :destroy
	has_many :accounts, through: :transaction_accounts

	class << self
		def update_from_json(json)
			s = includes(:header, :accounts).find json[:id]
			s.update_from_json json
			s
		end
	end

	def as_json(options = {})
		primary_account = investment_account
		other_account = cash_account
		primary_account, other_account = other_account, primary_account if options[:primary_account].eql? other_account.account_id

		super.merge primary_account: primary_account.account.as_json,
			category: self.class.transaction_category({'transaction_type' => transaction_type, 'direction' => primary_account.direction}, primary_account.account.account_type),
			account: other_account.account.as_json,
			amount: amount.to_f,
			direction: primary_account.direction,
			status: primary_account.status,
			related_status: other_account.status
	end

	def investment_account
		account_of_type 'investment'
	end

	def cash_account
		account_of_type 'bank'
	end

	# :nocov:

	private unless ::Rails.env.test?

	# :nocov:end

	def account_of_type(account_type)
		transaction_accounts.find { |trx_account| trx_account.account&.account_type.eql? account_type }
	end

	def validate_cash_account_type
		errors.add :base, 'Cash account must be a bank account' if cash_account.nil?
	end
end
