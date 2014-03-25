class Transaction < ActiveRecord::Base
	validates :transaction_type, :presence => true, :inclusion => {:in => %w(Basic Split Transfer Payslip LoanRepayment Subtransfer SecurityTransfer SecurityHolding SecurityInvestment Dividend)}

	class << self
		def class_for(type)
			return "#{type}Transaction".constantize
		end
	end
end
