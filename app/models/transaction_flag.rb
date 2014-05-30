class TransactionFlag < ActiveRecord::Base
	belongs_to :trx, :foreign_key => 'transaction_id', :class_name => 'Transaction'
	self.primary_key = "transaction_id"
end
