class TransactionFlag < ApplicationRecord
	belongs_to :trx, foreign_key: 'transaction_id', class_name: 'Transaction', optional: true
	self.primary_key = "transaction_id"
end
