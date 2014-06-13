class SubtransferTransaction < PayeeCashTransaction
	has_one :transaction_split, :foreign_key => 'transaction_id', :dependent => :delete
	has_one :parent, :class_name => 'SplitTransaction', :through => :transaction_split
	has_one :transaction_account, :foreign_key => 'transaction_id', :autosave => true, :dependent => :destroy
	has_one :account, :through => :transaction_account

	def as_json(options={})
		super.merge({
			:primary_account => self.account.as_json,
			:category => {
				:id => options[:direction].eql?('inflow') && 'TransferFrom' || 'TransferTo',
				:name => options[:direction].eql?('inflow') && 'Transfer From' || 'Transfer To'
			},
			:account => self.parent.account.as_json,
			:direction => self.transaction_account.direction,
			:status => self.transaction_account.status,
			:related_status => self.parent.transaction_account.status,
			:parent_id => self.parent.id
		})
	end
end
