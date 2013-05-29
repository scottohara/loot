class TransactionHeader < ActiveRecord::Base
	attr_accessible :transaction_date
	validates :transaction_date, :presence => true
	belongs_to :transaction
	belongs_to :payee
end
