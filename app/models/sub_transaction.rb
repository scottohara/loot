class SubTransaction < CashTransaction
	has_one :transaction_split, :foreign_key => 'transaction_id', :dependent => :delete
	has_one :parent, :class_name => 'SplitTransaction', :through => :transaction_split
	has_one :transaction_category, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :category, :through => :transaction_category

	def as_json(options={})
		super.merge self.parent.header.as_json.merge({
			:primary_account => self.parent.account.as_json,
			:category => self.category.parent.blank? && self.category.as_json || self.category.parent.as_json,
			:subcategory => self.category.parent.present? && self.category.as_json || nil,
			:direction => self.parent.transaction_account.direction,
			:parent_id => self.parent.id
		})
	end
end
