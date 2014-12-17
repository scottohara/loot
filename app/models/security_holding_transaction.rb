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
			s = super
			s.build_transaction_account(:direction => json['direction'], :status => json['status']).account = Account.find(json['primary_account']['id'])
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
		super
		self.transaction_account.direction = json['direction']
		self.account = Account.find(json['primary_account']['id'])
		self.save!
	end

	def as_json(options={})
		super.merge({
			:primary_account => self.account.as_json,
			:category => {
				:id => self.transaction_account.direction.eql?('inflow') && 'AddShares' || 'RemoveShares',
				:name => self.transaction_account.direction.eql?('inflow') && 'Add Shares' || 'Remove Shares'
			},
			:direction => self.transaction_account.direction,
			:status => self.transaction_account.status,
			:quantity => self.header.quantity
		})
	end
end
