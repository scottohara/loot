class PayeeCashTransaction < CashTransaction
	has_one :header, :class_name => 'PayeeTransactionHeader', :foreign_key => 'transaction_id', :dependent => :destroy, :autosave => true
end
