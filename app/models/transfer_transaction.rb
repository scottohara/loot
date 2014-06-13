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
			source, destination = Account.find(json['primary_account']['id']), Account.find(json['account']['id'])
			source, destination = destination, source if json['direction'].eql? 'inflow'

			s = self.new(:id => json[:id], :amount => json['amount'], :memo => json['memo'])
			s.build_source_transaction_account(:direction => 'outflow').account = source
			s.build_destination_transaction_account(:direction => 'inflow').account = destination
			s.build_header.update_from_json json
			s.save!
			s.as_json :direction => json['direction']
		end

		def update_from_json(json)
			s = self.includes(:header, :source_account, :destination_account).find(json[:id])
			s.update_from_json(json)
			s.as_json :direction => json['direction']
		end
	end

	def update_from_json(json)
		source, destination = Account.find(json['primary_account']['id']), Account.find(json['account']['id'])
		source, destination = destination, source if json['direction'].eql? 'inflow'

		self.amount = json['amount']
		self.memo = json['memo']
		self.source_account = source
		self.destination_account = destination
		self.header.update_from_json json
		self.save!
	end

	def as_json(options={})
		primary_account, other_account, category_direction, status, related_status = self.source_account, self.destination_account, 'To', self.source_transaction_account.status, self.destination_transaction_account.status
		primary_account, other_account, category_direction, status, related_status = other_account, primary_account, 'From', related_status, status if options[:direction].eql? 'inflow'

		super.merge({
			:primary_account => primary_account.as_json,
			:category => {
				:id => "Transfer#{category_direction}",
				:name => "Transfer #{category_direction}"
			},
			:account => other_account.as_json,
			:direction => options[:direction],
			:status => status,
			:related_status => related_status
		})
	end
end
