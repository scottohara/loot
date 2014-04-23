class PayeeTransactionHeader < TransactionHeader
	validates :security_id, :quantity, :commission, :price, :absence => true
	belongs_to :payee

	def update_from_json(json)
		super
		self.payee = Payee.find_or_new(json['payee'])
		self
	end
end
