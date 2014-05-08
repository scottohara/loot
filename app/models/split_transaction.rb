class SplitTransaction < PayeeCashTransaction
	has_one :transaction_account, :foreign_key => 'transaction_id', :autosave => true, :dependent => :destroy
	has_one :account, :through => :transaction_account
	has_many :transaction_splits, :foreign_key => 'parent_id', :inverse_of => :parent, :dependent => :destroy
	has_many :subtransactions, -> { where :transaction_type => 'Basic' }, :class_name => 'Subtransaction', :through => :transaction_splits, :source => :transaction
	has_many :subtransfers, -> { where :transaction_type =>'Subtransfer' }, :class_name => 'SubtransferTransaction', :through => :transaction_splits, :source => :transaction
	after_initialize do |t|
		t.transaction_type = 'Split'
	end

	include Categorisable

	class << self
		def create_from_json(json)
			s = self.new(:id => json[:id], :amount => json['amount'], :memo => json['memo'])
			s.build_transaction_account(:direction => json['direction']).account = Account.find(json['account_id'])
			s.build_header.update_from_json json
			s.create_children(json['subtransactions'])
			s.save!
			s
		end

		def update_from_json(json)
			s = self.includes(:header, :transaction_account).find(json[:id])
			s.update_from_json(json)
			s
		end
	end

	def create_children(children)
		children.each do |child|
			# Keys could be symbols or strings
			child = child.with_indifferent_access

			case child['transaction_type']
				when 'Basic' then
					category = Category.find_or_new(child['category'])
					category = Category.find_or_new(child['subcategory'], category) unless child['subcategory'].nil? || child['subcategory']['id'].nil?
					self.transaction_splits.build.build_transaction(:amount => child['amount'], :memo => child['memo'], :transaction_type => 'Basic').build_transaction_category.category = category
				else
					direction = child['direction'].eql?('inflow') && 'outflow' || 'inflow' 
					t = self.transaction_splits.build.build_transaction(:amount => child['amount'], :memo => child['memo'], :transaction_type => 'Subtransfer')
					t.build_transaction_account(:direction => direction).account = Account.find(child['account']['id'])
					t.build_flag(:memo => child['flag']) if !!child['flag']
			end
		end
	end

	def update_from_json(json)
		self.amount = json['amount']
		self.memo = json['memo']
		self.transaction_account.direction = json['direction']
		self.header.update_from_json json
		self.subtransactions.each &:destroy
		self.subtransfers.each &:destroy
		self.create_children(json['subtransactions'])
		self.save!
	end

	def as_json(options={})
		{
			:id => self.id,
			:transaction_type => self.transaction_type,
			:transaction_date => self.header.transaction_date,
			:schedule_account => self.header.schedule.present? && self.account.as_json || nil,
			:next_due_date => self.header.schedule.present? && self.header.schedule.next_due_date || nil,
			:frequency => self.header.schedule.present? && self.header.schedule.frequency || nil,
			:estimate => self.header.schedule.present? && self.header.schedule.estimate || nil,
			:auto_enter => self.header.schedule.present? && self.header.schedule.auto_enter || nil,
			:payee => self.header.payee.as_json,
			:category => {
				:id => self.transaction_account.direction.eql?('inflow') && 'SplitFrom' || 'SplitTo',
				:name => self.transaction_account.direction.eql?('inflow') && 'Split From' || 'Split To'
			},
			:amount => self.amount,
			:direction => self.transaction_account.direction,
			:memo => self.memo
		}
	end

	def children
		# Get the child transactions
		transactions = TransactionSplit
			.select(	"transactions.id",
						 		"transactions.transaction_type",
								"parent_transactions.transaction_type AS parent_transaction_type",
						 		"categories.id AS category_id",
								"categories.name AS category_name",
								"categories.direction AS category_direction",
								"parent_categories.id AS parent_category_id",
								"parent_categories.name AS parent_category_name",
								"accounts.id AS account_id",
								"accounts.name AS account_name",
								"transactions.amount",
								"transaction_accounts.direction",
						 		"transactions.memo",
						 		"transaction_flags.memo AS flag") 
			.joins(		"JOIN transaction_accounts ON transaction_accounts.transaction_id = transaction_splits.parent_id")
			.joins(		"JOIN transactions ON transactions.id = transaction_splits.transaction_id")
			.joins(		"JOIN transactions parent_transactions ON parent_transactions.id = transaction_splits.parent_id")
			.joins(		"LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id")
			.joins(		"LEFT OUTER JOIN categories ON categories.id = transaction_categories.category_id")
			.joins(		"LEFT OUTER JOIN categories parent_categories ON parent_categories.id = categories.parent_id")
			.joins(		"LEFT OUTER JOIN transaction_accounts transfer_transaction_accounts ON transfer_transaction_accounts.transaction_id = transactions.id AND transfer_transaction_accounts.account_id != transaction_accounts.account_id")
			.joins(		"LEFT OUTER JOIN accounts ON accounts.id = transfer_transaction_accounts.account_id")
			.joins(		"LEFT OUTER JOIN transaction_flags ON transaction_flags.transaction_id = transactions.id")
			.where(		"transaction_splits.parent_id = ?", self.id)

		# Remap to the desired output format
		transactions.map do |trx|
			{
				:id => trx['id'],
				:transaction_type => trx['transaction_type'],
				:category => self.class.transaction_category(trx),
				:subcategory => self.class.basic_subcategory(trx),
				:account => {
					:id => trx['account_id'],
					:name => trx['account_name']
				},
				:amount => trx['amount'],
				:direction => (trx['transaction_type'].eql?('Subtransfer') && (trx['parent_transaction_type'].eql?('Payslip') && 'outflow' || trx['direction']) || trx['category_direction']),
				:memo => trx['memo'],
				:flag => trx['flag']
			}
		end
	end
end
