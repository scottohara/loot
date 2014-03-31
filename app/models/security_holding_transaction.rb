class SecurityHoldingTransaction < SecurityTransaction
	validates :amount, :absence => true
	validate :validate_quantity_presence, :validate_price_absence, :validate_commission_absence
	has_one :transaction_account, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :account, :through => :transaction_account
	after_initialize do |t|
		t.transaction_type = 'SecurityHolding'
	end

	class << self
		def create_from_json(json)
			s = self.new(:id => json[:id], :memo => json['memo'])
			s.build_transaction_account(:direction => json['direction']).account = Account.find(json['account_id'])
			s.build_header(:transaction_date => json['transaction_date'], :quantity => json['quantity']).security = Security.find_or_new(json['security'])
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
		self.memo = json['memo']
		self.header.transaction_date = json['transaction_date']
		self.header.quantity = json['quantity']
		self.header.security = Security.find_or_new(json['security'])
		self.save!
	end

	def as_json(options={})
		{
			:id => self.id,
			:transaction_type => self.transaction_type,
			:transaction_date => self.header.transaction_date,
			:security => self.header.security.as_json,
			:category => {
				:id => self.transaction_account.direction.eql?('inflow') && 'AddShares' || 'RemoveShares',
				:name => self.transaction_account.direction.eql?('inflow') && 'Add Shares' || 'Remove Shares'
			},
			:quantity => self.header.quantity,
			:direction => self.transaction_account.direction,
			:memo => self.memo
		}
	end
end
