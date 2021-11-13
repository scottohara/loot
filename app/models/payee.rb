# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Payee
class Payee < ApplicationRecord
	validates :name, presence: true
	has_many :payee_transaction_headers, dependent: :restrict_with_error
	has_many :transactions, through: :payee_transaction_headers, source: :trx do
		def for_ledger(_opts)
			joins(
				[
					'LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id',
					'LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id',
					'LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id'
				]
			)
				.where('transactions.transaction_type != \'Subtransfer\'')
		end

		def for_closing_balance(_opts)
			joins 'JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id'
		end

		def for_basic_closing_balance(_opts)
			joins [
				'JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id',
				'JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id'
			]
		end
	end

	include ::Transactable
	include ::Favouritable

	class << self
		def find_or_new(payee)
			!payee.is_a?(::String) && payee['id'].present? ? find(payee['id']) : new(name: payee)
		end
	end

	def opening_balance
		0
	end

	def account_type
		nil
	end

	def as_json
		# Defer to serializer
		::ActiveModelSerializers::SerializableResource.new(self).as_json
	end
end
