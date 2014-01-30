class Transaction < ActiveRecord::Base
	validates :transaction_type, :presence => true, :inclusion => {:in => %w(Basic Split Transfer Payslip LoanRepayment Subtransfer SecurityTransfer SecurityHolding SecurityInvestment Dividend)}
end
