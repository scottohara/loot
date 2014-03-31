class PayeeTransactionHeader < TransactionHeader
	validates :security_id, :quantity, :commission, :price, :absence => true
	belongs_to :payee
end
