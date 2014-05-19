class Transaction < ActiveRecord::Base
	validates :transaction_type, :presence => true, :inclusion => {:in => %w(Basic Split Transfer Payslip LoanRepayment Subtransfer SecurityTransfer SecurityHolding SecurityInvestment Dividend)}
	has_one :flag, :class_name => 'TransactionFlag', :foreign_key => 'transaction_id', :dependent => :destroy, :autosave => true

	class << self
		def class_for(type)
			"#{type}Transaction".constantize
		end

		def types_for(account_type)
			account_type.eql?('investment') && %w(SecurityTransfer SecurityHolding SecurityInvestment Dividend) || %w(Basic Split Transfer Payslip LoanRepayment)
		end
	end

	def as_subclass
		self.becomes self.class.class_for(self.transaction_type)
	end
end
