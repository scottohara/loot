# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Payslip transaction
class PayslipTransaction < SplitTransaction
	after_initialize do |t|
		t.transaction_type = 'Payslip'
	end

	def as_json(options = {})
		super.merge(
			category: {
				id: transaction_type,
				name: transaction_type
			}
		)
	end
end
