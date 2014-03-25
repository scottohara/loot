class SecurityInvestmentTransaction < SecurityTransaction
	validates :quantity, :amount, :commission, :presence => true
	has_many :transaction_accounts, :foreign_key => 'transaction_id', :autosave => true, :dependent => :destroy
	has_many :accounts, :through => :transaction_accounts
	after_initialize do |t|
		t.transaction_type = 'SecurityInvestment'
	end

	#TODO - security price
	
	class << self
		def create_from_json(json)
			cash_direction = json['direction'].eql?('inflow') && 'outflow' || 'inflow'

			s = self.new(:id => json[:id], :amount => json['amount'], :quantity => json['quantity'], :commission => json['commission'], :memo => json['memo'])
			s.transaction_accounts.build(:direction => json['direction']).account = Account.find(json['account_id'])
			s.transaction_accounts.build(:direction => cash_direction).account = Account.find(json['account']['id'])
			s.build_header(:transaction_date => json['transaction_date']).security = Security.find_or_new(json['security'])
			s.save!
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

		self.amount = json['amount']
		self.quantity = json['quantity']
		self.commission = json['commission']
		self.memo = json['memo']
		self.investment_account.direction = json['direction']
		self.cash_account.direction = cash_direction
		self.cash_account.account = Account.find(json['account']['id'])
		self.header.transaction_date = json['transaction_date']
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
				:id => self.investment_account.direction.eql?('inflow') && 'Buy' || 'Sell',
				:name => self.investment_account.direction.eql?('inflow') && 'Buy' || 'Sell'
			},
			:account => self.cash_account.account.as_json,
			:amount => self.amount,
			:quantity => self.quantity,
			:commission => self.commission,
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
