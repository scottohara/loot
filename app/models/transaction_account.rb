class TransactionAccount < ActiveRecord::Base
	validates :direction, :presence => true, :inclusion => {:in => %w(inflow outflow)}
	validates :status, :inclusion => {:in => %w(pending cleared)}, :allow_blank => true
	belongs_to :account
	belongs_to :transaction
end
