class SplitTransaction < PayeeCashTransaction
	has_one :transaction_account, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :account, :through => :transaction_account
	has_many :transaction_splits, :foreign_key => 'parent_id', :inverse_of => :parent, :dependent => :destroy
	has_many :subtransactions, -> { where :transaction_type => 'Basic' }, :class_name => 'Subtransaction', :through => :transaction_splits, :source => :transaction
	has_many :subtransfers, -> { where :transaction_type =>'Subtransfer' }, :class_name => 'SubtransferTransaction', :through => :transaction_splits, :source => :transaction
	after_initialize do |t|
		t.transaction_type = 'Split'
	end
end
