class TransferTransaction < Transaction
	has_one :source_transaction_account, :class_name => 'TransactionAccount', :conditions => {:direction => 'outflow'}, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :source_account, :class_name => 'Account', :through => :source_transaction_account, :source => :account
	has_one :destination_transaction_account, :class_name => 'TransactionAccount', :conditions => {:direction => 'inflow'}, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :destination_account, :class_name => 'Account', :through => :destination_transaction_account, :source => :account
	has_one :header, :class_name => 'TransactionHeader', :foreign_key => 'transaction_id', :dependent => :destroy
	after_initialize do |t|
		t.transaction_type = 'Transfer'
	end
end
