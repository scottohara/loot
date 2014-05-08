class TransactionFlag < ActiveRecord::Base
	belongs_to :transaction
	self.primary_key = "transaction_id"
end
