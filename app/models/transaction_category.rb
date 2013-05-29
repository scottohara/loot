class TransactionCategory < ActiveRecord::Base
	belongs_to :transaction
	belongs_to :category
end
