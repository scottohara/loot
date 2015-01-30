class SecurityTransferTransaction < SecurityTransaction
	validates :amount, absence: true
	validate :validate_quantity_presence, :validate_price_absence, :validate_commission_absence, :validate_account_uniqueness
	has_one :source_transaction_account, -> { where direction: 'outflow' }, class_name: 'TransactionAccount', foreign_key: 'transaction_id', dependent: :destroy
	has_one :source_account, class_name: 'Account', through: :source_transaction_account, source: :account
	has_one :destination_transaction_account, -> { where direction: 'inflow' }, class_name: 'TransactionAccount', foreign_key: 'transaction_id', dependent: :destroy
	has_one :destination_account, class_name: 'Account', through: :destination_transaction_account, source: :account
	after_initialize do |t|
		t.transaction_type = 'SecurityTransfer'
	end

	class << self
		def create_from_json(json)
			source, destination, source_status, destination_status = Account.find(json['primary_account']['id']), Account.find(json['account']['id']), json['status'], json['related_status']
			source, destination, source_status, destination_status = destination, source, destination_status, source_status if json['direction'].eql? 'inflow'

			# Make sure price and commission are nil
			json['price'] = nil
			json['commission'] = nil

			s = super
			s.build_source_transaction_account(direction: 'outflow', status: source_status).account = source
			s.build_destination_transaction_account(direction: 'inflow', status: destination_status).account = destination
			s.save!
			s.as_json direction: json['direction']
		end

		def update_from_json(json)
			s = self.includes(:header, :source_account, :destination_account).find(json[:id])
			s.update_from_json(json)
			s.as_json direction: json['direction']
		end
	end

	def validate_account_uniqueness
		errors[:base] << "Source and destination account can't be the same" if (source_transaction_account || destination_transaction_account) && source_transaction_account.account.eql?(destination_transaction_account.account)
	end

	def update_from_json(json)
		source, destination = Account.find(json['primary_account']['id']), Account.find(json['account']['id'])
		source, destination = destination, source if json['direction'].eql? 'inflow'

		super
		self.source_account = source
		self.destination_account = destination
		self.save!
	end

	def as_json(options={})
		primary_account, other_account, category_direction, status, related_status = self.source_account, self.destination_account, 'To', self.source_transaction_account.status, self.destination_transaction_account.status
		primary_account, other_account, category_direction, status, related_status = other_account, primary_account, 'From', related_status, status if options[:direction].eql? 'inflow'

		super.merge({
			primary_account: primary_account.as_json,
			category: {
				id: "Transfer#{category_direction}",
				name: "Transfer #{category_direction}"
			},
			account: other_account.as_json,
			direction: options[:direction],
			quantity: self.header.quantity,
			status: status,
			related_status: related_status
		})
	end
end
