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
			s.build_header.update_from_json json
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
		self.header.update_from_json json
		self.save!
	end

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
