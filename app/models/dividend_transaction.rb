class DividendTransaction < SecurityTransaction
	validates :amount, :presence => true
	validates :quantity, :absence => true
	has_many :transaction_accounts, :foreign_key => 'transaction_id', :autosave => true, :dependent => :destroy
	has_many :accounts, :through => :transaction_accounts
	after_initialize do |t|
		t.transaction_type = 'Dividend'
	end

	class << self
		def create_from_json(json)
			s = self.new(:id => json[:id], :amount => json['amount'], :memo => json['memo'])
			s.transaction_accounts.build(:direction => 'outflow').account = Account.find(json['account_id'])
			s.transaction_accounts.build(:direction => 'inflow').account = Account.find(json['account']['id'])
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
		self.amount = json['amount']
		self.memo = json['memo']
		self.cash_account = Account.find(json['account']['id'])
		self.header.transaction_date = json['transaction_date']
		self.header.security = Security.find_or_new(json['security'])
		self.save!

		# If the cash account has changed, clear the association cache
		self.accounts(true) unless self.cash_account.id.eql? json['account']['id']
	end

	def as_json(options={})
		{
			:id => self.id,
			:transaction_type => self.transaction_type,
			:transaction_date => self.header.transaction_date,
			:security => self.header.security.as_json,
			:category => {
				:id => 'DividendTo',
				:name => 'Dividend To'
			},
			:account => self.cash_account.as_json,
			:amount => self.amount,
			:direction => 'outflow',
			:memo => self.memo
		}
	end

	def investment_account
		self.accounts.select {|account| account.account_type.eql? 'investment'}.first
	end

	def cash_account
		self.accounts.select {|account| account.account_type.eql? 'bank'}.first
	end

	def cash_account=(account)
		# Previous cash account
		previous_cash_account = self.cash_account

		# If the account is unchanged, do nothing
		return if account.id.eql? previous_cash_account.id

		# Get the (one and only) transaction account for the previous cash account
		transaction_account = self.transaction_accounts.select {|trx_account| trx_account.account_id.eql? previous_cash_account.id}.first

		# Update to the new account
		transaction_account.account = account
	end
end
