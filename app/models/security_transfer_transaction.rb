class SecurityTransferTransaction < SecurityTransaction
	validates :amount, :absence => true
	validate :validate_quantity_presence, :validate_price_absence, :validate_commission_absence
	has_one :source_transaction_account, -> { where :direction => 'outflow' }, :class_name => 'TransactionAccount', :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :source_account, :class_name => 'Account', :through => :source_transaction_account, :source => :account
	has_one :destination_transaction_account, -> { where :direction => 'inflow' }, :class_name => 'TransactionAccount', :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :destination_account, :class_name => 'Account', :through => :destination_transaction_account, :source => :account
	after_initialize do |t|
		t.transaction_type = 'SecurityTransfer'
	end

	class << self
		def create_from_json(json)
			source, destination = Account.find(json['account_id']), Account.find(json['account']['id'])
			source, destination = destination, source if json['direction'].eql? 'inflow'

			s = self.new(:id => json[:id], :memo => json['memo'])
			s.build_source_transaction_account(:direction => 'outflow').account = source
			s.build_destination_transaction_account(:direction => 'inflow').account = destination
			s.build_header.update_from_json json
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

		self.memo = json['memo']
		self.source_account = source
		self.destination_account = destination
		self.header.update_from_json json
		self.save!
	end

	def as_json(options={})
		{
			:id => self.id,
			:transaction_type => self.transaction_type,
			:transaction_date => self.header.transaction_date,
			:primary_account => options[:direction].eql?('outflow') && self.source_account.as_json || self.destination_account.as_json,
			:next_due_date => self.header.schedule.present? && self.header.schedule.next_due_date || nil,
			:frequency => self.header.schedule.present? && self.header.schedule.frequency || nil,
			:estimate => self.header.schedule.present? && self.header.schedule.estimate || nil,
			:auto_enter => self.header.schedule.present? && self.header.schedule.auto_enter || nil,
			:security => self.header.security.as_json,
			:category => {
				:id => options[:direction].eql?('inflow') && 'TransferFrom' || 'TransferTo',
				:name => options[:direction].eql?('inflow') && 'Transfer From' || 'Transfer To'
			},
			:account => options[:direction].eql?('inflow') && self.source_account.as_json || self.destination_account.as_json,
			:quantity => self.header.quantity,
			:direction => options[:direction],
			:memo => self.memo
		}
	end
end
