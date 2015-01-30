class LoanRepaymentTransaction < SplitTransaction
	after_initialize do |t|
		t.transaction_type = 'LoanRepayment'
	end

	def as_json(options={})
		super.merge({
			category: {
				id: self.transaction_type,
				name: "Loan Repayment"
			}
		})
	end
end
