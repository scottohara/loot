class SecurityTransaction < Transaction
	has_one :header, :class_name => 'SecurityTransactionHeader', :foreign_key => 'transaction_id', :dependent => :destroy
end
