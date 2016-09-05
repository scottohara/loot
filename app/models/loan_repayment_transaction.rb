# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Loan repayment transaction
class LoanRepaymentTransaction < SplitTransaction
	after_initialize do |t|
		t.transaction_type = 'LoanRepayment'
	end

	def as_json(options = {})
		super.merge(
			category: {
				id: transaction_type,
				name: 'Loan Repayment'
			}
		)
	end
end
