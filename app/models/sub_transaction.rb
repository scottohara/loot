class SubTransaction < CashTransaction
	has_one :transaction_split, :foreign_key => 'transaction_id', :dependent => :delete
	has_one :parent, :class_name => 'SplitTransaction', :through => :transaction_split
	has_one :transaction_category, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :category, :through => :transaction_category

	def as_json(options={})
		{
			:id => self.id,
			:transaction_type => self.transaction_type,
			:transaction_date => self.parent.header.transaction_date,
			:primary_account => self.parent.account.as_json,
			:next_due_date => self.parent.header.schedule.present? && self.parent.header.schedule.next_due_date || nil,
			:frequency => self.parent.header.schedule.present? && self.parent.header.schedule.frequency || nil,
			:estimate => self.parent.header.schedule.present? && self.parent.header.schedule.estimate || nil,
			:auto_enter => self.parent.header.schedule.present? && self.parent.header.schedule.auto_enter || nil,
			:payee => self.parent.header.payee.as_json,
			:category => self.category.parent.blank? && self.category.as_json || self.category.parent.as_json,
			:subcategory => self.category.parent.present? && self.category.as_json || nil,
			:amount => self.amount,
			:direction => self.parent.transaction_account.direction,
			:memo => self.memo
		}
	end
end
