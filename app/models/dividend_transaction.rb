class DividendTransaction < SecurityTransaction
	validates :amount, :presence => true
	validate :validate_quantity_absence, :validate_price_absence, :validate_commission_absence
	has_many :transaction_accounts, :foreign_key => 'transaction_id', :autosave => true, :dependent => :destroy
	has_many :accounts, :through => :transaction_accounts
	after_initialize do |t|
		t.transaction_type = 'Dividend'
	end

	class << self
		def create_from_json(json)
			s = self.new(:id => json[:id], :amount => json['amount'], :memo => json['memo'])
			s.transaction_accounts.build(:direction => 'outflow').account = Account.find(json['primary_account']['id'])
			s.transaction_accounts.build(:direction => 'inflow').account = Account.find(json['account']['id'])
			s.build_header.update_from_json json
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
		self.amount = json['amount']
		self.memo = json['memo']
		self.investment_account.account = Account.find(json['primary_account']['id'])
		self.cash_account.account = Account.find(json['account']['id'])
		self.header.update_from_json json
		self.save!
	end

	def as_json(options={})
		super.merge({
			:primary_account => self.investment_account.account.as_json,
			:category => {
				:id => 'DividendTo',
				:name => 'Dividend To'
			},
			:account => self.cash_account.account.as_json,
			:amount => self.amount,
			:direction => 'outflow',
			:status => self.investment_account.status,
			:related_status => self.cash_account.status
		})
	end

	def investment_account
		self.transaction_accounts.select {|trx_account| trx_account.account.account_type.eql? 'investment'}.first
	end

	def cash_account
		self.transaction_accounts.select {|trx_account| trx_account.account.account_type.eql? 'bank'}.first
	end
end
