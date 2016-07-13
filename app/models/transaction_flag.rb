class TransactionFlag < ApplicationRecord
	belongs_to :trx, foreign_key: 'transaction_id', class_name: 'Transaction', inverse_of: :flag
	self.primary_key = "transaction_id"
end
