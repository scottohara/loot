class LoanRepaymentTransaction < SplitTransaction
	after_initialize do |t|
		t.transaction_type = 'LoanRepayment'
	end
end
