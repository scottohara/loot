class SecurityTransferTransaction < SecurityTransaction
	validates :quantity, :presence => true
	validates :amount, :commission, :absence => true
	has_one :source_transaction_account, -> { where :direction => 'outflow' }, :class_name => 'TransactionAccount', :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :source_account, :class_name => 'Account', :through => :source_transaction_account, :source => :account
	has_one :destination_transaction_account, -> { where :direction => 'inflow' }, :class_name => 'TransactionAccount', :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :destination_account, :class_name => 'Account', :through => :destination_transaction_account, :source => :account
	after_initialize do |t|
		t.transaction_type = 'SecurityTransfer'
	end
end
