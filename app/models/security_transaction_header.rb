class SecurityTransactionHeader < TransactionHeader
	validates :payee_id, :absence => true
	belongs_to :security
end
