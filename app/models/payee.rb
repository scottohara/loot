class Payee < ActiveRecord::Base
	validates :name, presence: true
	has_many :payee_transaction_headers
	has_many :transactions, through: :payee_transaction_headers, source: :trx do
		def for_ledger(opts)
			joins([	"LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id"])
			.where(	"transactions.transaction_type != 'Subtransfer'")
		end

		def for_closing_balance(opts)
			joins("JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id")
		end

		def for_basic_closing_balance(opts)
			joins([	"JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
							"JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id"])
		end
	end

	include Transactable
	include Favouritable

	class << self
		def find_or_new(payee)
			(payee.is_a?(Hash) && payee['id'].present?) ? self.find(payee['id']) : self.new(name: payee)
		end
	end

	def opening_balance
		0
	end

	def account_type
		nil
	end

	def as_json(options={})
		# Defer to serializer
		PayeeSerializer.new(self, options).as_json
	end
end
