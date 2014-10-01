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
			s.transaction_accounts.build(:direction => json['direction']).account = Account.find(json['primary_account']['id'])
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
		self.investment_account.account = Account.find(json['primary_account']['id'])
		self.cash_account.direction = cash_direction
		self.cash_account.account = Account.find(json['account']['id'])
		self.header.update_from_json json
		self.save!
		security.update_price!(json['price'], json['transaction_date'], json[:id]) unless json['transaction_date'].nil?
	end

	def as_json(options={})
		primary_account, other_account = self.investment_account, self.cash_account
		primary_account, other_account = other_account, primary_account if options[:primary_account].eql? other_account.account_id

		super.merge({
			:primary_account => primary_account.account.as_json,
			:category => self.class.transaction_category({'transaction_type' => self.transaction_type, 'direction' => primary_account.direction}, primary_account.account.account_type),
			:account => other_account.account.as_json,
			:amount => self.amount,
			:direction => primary_account.direction,
			:status => primary_account.status,
			:related_status => other_account.status,
			:quantity => self.header.quantity,
			:price => self.header.price,
			:commission => self.header.commission
		})
	end

	def investment_account
		self.transaction_accounts.select {|trx_account| trx_account.account.account_type.eql? 'investment'}.first
	end

	def cash_account
		self.transaction_accounts.select {|trx_account| trx_account.account.account_type.eql? 'bank'}.first
	end
end
