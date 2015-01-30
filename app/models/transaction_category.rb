class TransactionCategory < ActiveRecord::Base
	belongs_to :trx, foreign_key: 'transaction_id', class_name: 'Transaction'
	belongs_to :category
	self.primary_key = "transaction_id"
end
