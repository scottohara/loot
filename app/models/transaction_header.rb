class TransactionHeader < ActiveRecord::Base
	validates :transaction_date, :presence => true
	belongs_to :transaction
	self.primary_key = "transaction_id"
end
