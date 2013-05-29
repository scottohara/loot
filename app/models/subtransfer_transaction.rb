class SubtransferTransaction < Transaction
	has_one :transaction_split, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :parent, :class_name => 'SplitTransaction', :through => :transaction_split
	has_one :transaction_account, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :account, :through => :transaction_account
	has_one :header, :class_name => 'TransactionHeader', :foreign_key => 'transaction_id', :dependent => :destroy
end
