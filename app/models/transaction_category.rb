class TransactionCategory < ActiveRecord::Base
	belongs_to :transaction
	belongs_to :category
	self.primary_key = "transaction_id"
end
