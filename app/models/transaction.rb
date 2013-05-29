class Transaction < ActiveRecord::Base
	attr_accessible :amount, :memo, :transaction_type
	validates :amount, :presence => true
	validates :transaction_type, :presence => true, :inclusion => {:in => %w(Basic Split Transfer Payslip LoanRepayment Subtransfer)}
end
