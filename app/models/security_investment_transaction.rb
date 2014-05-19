class SecurityInvestmentTransaction < SecurityTransaction
	validates :amount, :presence => true
	validate :validate_quantity_presence, :validate_price_presence, :validate_commission_presence
	has_many :transaction_accounts, :foreign_key => 'transaction_id', :autosave => true, :dependent => :destroy
	has_many :accounts, :through => :transaction_accounts
	after_initialize do |t|
		t.transaction_type = 'SecurityInvestment'
	end

	class << self
		def create_from_json(json)
			cash_direction = json['direction'].eql?('inflow') && 'outflow' || 'inflow'
			security = Security.find_or_new json['security']

			s = self.new(:id => json[:id], :amount => json['amount'], :memo => json['memo'])
			s.transaction_accounts.build(:direction => json['direction']).account = Account.find(json['account_id'])
			s.transaction_accounts.build(:direction => cash_direction).account = Account.find(json['account']['id'])
			s.build_header.update_from_json json
			s.save!
			security.update_price!(json['price'], json['transaction_date'], json[:id]) unless json['transaction_date'].nil?
			s
		end

		def update_from_json(json)
			s = self.includes(:header, :accounts).find(json[:id])
			s.update_from_json(json)
			s
		end
	end

	def update_from_json(json)
		cash_direction = json['direction'].eql?('inflow') && 'outflow' || 'inflow'
		security = Security.find_or_new json['security']

		self.amount = json['amount']
		self.memo = json['memo']
		self.investment_account.direction = json['direction']
		self.cash_account.direction = cash_direction
		self.cash_account.account = Account.find(json['account']['id'])
		self.header.update_from_json json
		self.save!
		security.update_price!(json['price'], json['transaction_date'], json[:id]) unless json['transaction_date'].nil?
	end

	def as_json(options={})
		{
			:id => self.id,
			:transaction_type => self.transaction_type,
			:transaction_date => self.header.transaction_date,
			:primary_account => self.investment_account.account.as_json,
			:next_due_date => self.header.schedule.present? && self.header.schedule.next_due_date || nil,
			:frequency => self.header.schedule.present? && self.header.schedule.frequency || nil,
			:estimate => self.header.schedule.present? && self.header.schedule.estimate || nil,
			:auto_enter => self.header.schedule.present? && self.header.schedule.auto_enter || nil,
			:security => self.header.security.as_json,
			:category => {
				:id => self.investment_account.direction.eql?('inflow') && 'Buy' || 'Sell',
				:name => self.investment_account.direction.eql?('inflow') && 'Buy' || 'Sell'
			},
			:account => self.cash_account.account.as_json,
			:amount => self.amount,
			:quantity => self.header.quantity,
			:price => self.header.price,
			:commission => self.header.commission,
			:direction => self.investment_account.direction,
			:memo => self.memo
		}
	end

	def investment_account
		self.transaction_accounts.select {|trx_account| trx_account.account.account_type.eql? 'investment'}.first
	end

	def cash_account
		self.transaction_accounts.select {|trx_account| trx_account.account.account_type.eql? 'bank'}.first
	end
end
