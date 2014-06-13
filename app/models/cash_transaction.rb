class CashTransaction < Transaction
	validates :amount, :presence => true

	def as_json(options={})
		super.merge({
			:amount => self.amount
		})
	end
end
