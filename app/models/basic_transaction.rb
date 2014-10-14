class BasicTransaction < PayeeCashTransaction
	has_one :transaction_account, :foreign_key => 'transaction_id', :dependent => :destroy, :autosave => true
	has_one :account, :through => :transaction_account
	has_one :transaction_category, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :category, :through => :transaction_category
	after_initialize do |t|
		t.transaction_type = 'Basic'
	end

	class << self
		def create_from_json(json)
			category = Category.find_or_new json['category']
			category = Category.find_or_new(json['subcategory'], category) unless json['subcategory'].nil?

			# id included for the case where we destroy & recreate on transaction type change 
			s = self.new(:id => json[:id], :amount => json['amount'], :memo => json['memo'])
			s.build_transaction_account(:direction => category.direction).account = Account.find(json['primary_account']['id'])
			s.build_header.update_from_json json
			s.build_transaction_category.category = category
			s.save!
			s
		end

		def update_from_json(json)
			s = self.includes(:header).find(json[:id])
			s.update_from_json(json)
			s
		end
	end

	def update_from_json(json)
		category = Category.find_or_new json['category']
		category = Category.find_or_new(json['subcategory'], category) unless json['subcategory'].nil?

		self.amount = json['amount']
		self.memo = json['memo']
		self.header.update_from_json json
		self.transaction_account.direction = category.direction
		self.account = Account.find(json['primary_account']['id'])
		self.category = category
		self.save!
	end

	def as_json(options={})
		super.merge({
			:primary_account => self.account.as_json,
			:category => self.category.parent.blank? && self.category.as_json || self.category.parent.as_json,
			:subcategory => self.category.parent.present? && self.category.as_json || nil,
			:direction => self.transaction_account.direction,
			:status => self.transaction_account.status
		})
	end
end
