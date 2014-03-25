class TransferTransaction < PayeeCashTransaction
	has_one :source_transaction_account, -> { where :direction => 'outflow' }, :class_name => 'TransactionAccount', :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :source_account, :class_name => 'Account', :through => :source_transaction_account, :source => :account
	has_one :destination_transaction_account, -> { where :direction => 'inflow' }, :class_name => 'TransactionAccount', :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :destination_account, :class_name => 'Account', :through => :destination_transaction_account, :source => :account
	after_initialize do |t|
		t.transaction_type = 'Transfer'
	end

	class << self
		def create_from_json(json)
			source, destination = Account.find(json['account_id']), Account.find(json['account']['id'])
			source, destination = destination, source if json['direction'].eql? 'inflow'

			s = self.new(:id => json[:id], :amount => json['amount'], :memo => json['memo'])
			s.build_source_transaction_account(:direction => 'outflow').account = source
			s.build_destination_transaction_account(:direction => 'inflow').account = destination
			s.build_header(:transaction_date => json['transaction_date']).payee = Payee.find_or_new(json['payee'])
			s.save!
			s.as_json :direction => json['direction']
		end

		def update_from_json(json)
			s = self.includes(:header, :source_account, :destination_account).find(json[:id])
			s.update_from_json(json)
			s
		end
	end

	def update_from_json(json)
		source, destination = Account.find(json['account_id']), Account.find(json['account']['id'])
		source, destination = destination, source if json['direction'].eql? 'inflow'

		self.amount = json['amount']
		self.memo = json['memo']
		self.source_account = source
		self.destination_account = destination
		self.header.transaction_date = json['transaction_date']
		self.header.payee = Payee.find_or_new(json['payee'])
		self.save!
	end

	def as_json(options={})
		{
			:id => self.id,
			:transaction_type => self.transaction_type,
			:transaction_date => self.header.transaction_date,
			:payee => self.header.payee.as_json,
			:category => {
				:id => options[:direction].eql?('inflow') && 'TransferFrom' || 'TransferTo',
				:name => options[:direction].eql?('inflow') && 'Transfer From' || 'Transfer To'
			},
			:account => options[:direction].eql?('inflow') && self.source_account.as_json || self.destination_account.as_json,
			:amount => self.amount,
			:direction => options[:direction],
			:memo => self.memo
		}
	end
end
