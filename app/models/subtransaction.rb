class Subtransaction < CashTransaction
	has_one :transaction_split, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :parent, :class_name => 'SplitTransaction', :through => :transaction_split
	has_one :transaction_category, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :category, :through => :transaction_category
end
