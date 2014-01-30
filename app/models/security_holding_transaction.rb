class SecurityHoldingTransaction < SecurityTransaction
	validates :quantity, :presence => true
	validates :amount, :commission, :absence => true
	has_one :transaction_account, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :account, :through => :transaction_account
	after_initialize do |t|
		t.transaction_type = 'SecurityHolding'
	end
end
