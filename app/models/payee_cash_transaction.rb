class PayeeCashTransaction < CashTransaction
	has_one :header, :class_name => 'PayeeTransactionHeader', :foreign_key => 'transaction_id', :dependent => :destroy, :autosave => true

	def as_json(options={})
		super.merge self.header.as_json
	end
end
