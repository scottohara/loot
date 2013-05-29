class PayslipTransaction < SplitTransaction
	after_initialize do |t|
		t.transaction_type = 'Payslip'
	end
end
