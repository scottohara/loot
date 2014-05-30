class SubtransferTransaction < PayeeCashTransaction
	has_one :transaction_split, :foreign_key => 'transaction_id', :dependent => :delete
	has_one :parent, :class_name => 'SplitTransaction', :through => :transaction_split
	has_one :transaction_account, :foreign_key => 'transaction_id', :autosave => true, :dependent => :destroy
	has_one :account, :through => :transaction_account

	def as_json(options={})
		{
			:id => self.id,
			:transaction_type => self.transaction_type,
			:transaction_date => self.header.transaction_date,
			:primary_account => self.account.as_json,
			:next_due_date => self.header.schedule.present? && self.header.schedule.next_due_date || nil,
			:frequency => self.header.schedule.present? && self.header.schedule.frequency || nil,
			:estimate => self.header.schedule.present? && self.header.schedule.estimate || nil,
			:auto_enter => self.header.schedule.present? && self.header.schedule.auto_enter || nil,
			:payee => self.header.payee.as_json,
			:category => {
				:id => options[:direction].eql?('inflow') && 'TransferFrom' || 'TransferTo',
				:name => options[:direction].eql?('inflow') && 'Transfer From' || 'Transfer To'
			},
			:account => self.parent.account.as_json,
			:amount => self.amount,
			:direction => self.transaction_account.direction,
			:memo => self.memo
		}
	end
end
