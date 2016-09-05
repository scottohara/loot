# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security holding transaction
class SecurityHoldingTransaction < SecurityTransaction
	validates :amount, absence: true
	validate :validate_quantity_presence, :validate_price_absence, :validate_commission_absence
	has_one :transaction_account, foreign_key: 'transaction_id', dependent: :destroy
	has_one :account, through: :transaction_account
	after_initialize do |t|
		t.transaction_type = 'SecurityHolding'
	end

	class << self
		def create_from_json(json)
			# Make sure price and commission are nil
			json['price'] = nil
			json['commission'] = nil

			s = super
			s.build_transaction_account(direction: json['direction'], status: json['status']).account = Account.find json['primary_account']['id']
			s.save!
			s
		end

		def update_from_json(json)
			s = includes(:header).find json[:id]
			s.update_from_json json
			s
		end
	end

	def update_from_json(json)
		super
		transaction_account.direction = json['direction']
		self.account = Account.find json['primary_account']['id']
		save!
	end

	def as_json(options = {})
		super.merge(
			primary_account: account.as_json,
			category: {
				id: transaction_account.direction.eql?('inflow') && 'AddShares' || 'RemoveShares',
				name: transaction_account.direction.eql?('inflow') && 'Add Shares' || 'Remove Shares'
			},
			direction: transaction_account.direction,
			status: transaction_account.status,
			quantity: header.quantity
		)
	end
end
