class TransactionAccount < ActiveRecord::Base
	validates :direction, :presence => true, :inclusion => {:in => %w(inflow outflow)}
	belongs_to :account
	belongs_to :transaction
end
