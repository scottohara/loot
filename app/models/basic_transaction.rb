class BasicTransaction < PayeeCashTransaction
	has_one :transaction_account, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :account, :through => :transaction_account
	has_one :transaction_category, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :category, :through => :transaction_category
	after_initialize do |t|
		t.transaction_type = 'Basic'
	end
end
