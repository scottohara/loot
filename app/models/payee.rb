class Payee < ActiveRecord::Base
	validates :name, :presence => true
	has_many :payee_transaction_headers
	has_many :transactions, :through => :payee_transaction_headers do
		def ledger
			joins([	"LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id"])
			.where(	"transactions.transaction_type != 'Subtransfer'")
		end

		def closing_balance
			joins("JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id")
		end

		def closing_balance_basic
			closing_balance.joins("JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id")
		end
	end

	include Transactable

	class << self
		def find_or_new(payee)
			payee['id'].present? ? self.find(payee['id']) : self.new(:name => payee)
		end
	end

	def opening_balance
		0
	end

	def account_type
		nil
	end

	def as_json(options={})
		super :only => [:id, :name]
	end
end
