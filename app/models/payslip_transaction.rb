class PayslipTransaction < SplitTransaction
	after_initialize do |t|
		t.transaction_type = 'Payslip'
	end

	def as_json(options={})
		super.merge({
			:category => {
				:id => self.transaction_type,
				:name => self.transaction_type
			}
		})
	end
end
