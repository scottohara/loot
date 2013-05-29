class SplitTransaction < Transaction
	has_one :transaction_account, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :account, :through => :transaction_account
	has_one :header, :class_name => 'TransactionHeader', :foreign_key => 'transaction_id', :dependent => :destroy
	has_many :transaction_splits, :foreign_key => 'parent_id', :inverse_of => :parent, :dependent => :destroy
	has_many :subtransactions, :class_name => 'Subtransaction', :through => :transaction_splits, :source => :transaction, :conditions => {:transaction_type => 'Basic'}
	has_many :subtransfers, :class_name => 'SubtransferTransaction', :through => :transaction_splits, :source => :transaction, :conditions => {:transaction_type => 'Subtransfer'}
	after_initialize do |t|
		t.transaction_type = 'Split'
	end
end
