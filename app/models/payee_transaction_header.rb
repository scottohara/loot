class PayeeTransactionHeader < TransactionHeader
	validates :security_id, :absence => true
	belongs_to :payee
end
