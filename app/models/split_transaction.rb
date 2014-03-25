class SplitTransaction < PayeeCashTransaction
	has_one :transaction_account, :foreign_key => 'transaction_id', :autosave => true, :dependent => :destroy
	has_one :account, :through => :transaction_account
	has_many :transaction_splits, :foreign_key => 'parent_id', :inverse_of => :parent, :dependent => :destroy
	has_many :subtransactions, -> { where :transaction_type => 'Basic' }, :class_name => 'Subtransaction', :through => :transaction_splits, :source => :transaction
	has_many :subtransfers, -> { where :transaction_type =>'Subtransfer' }, :class_name => 'SubtransferTransaction', :through => :transaction_splits, :source => :transaction
	after_initialize do |t|
		t.transaction_type = 'Split'
	end

	class << self
		def create_from_json(json)
			s = self.new(:id => json[:id], :amount => json['amount'], :memo => json['memo'])
			s.build_transaction_account(:direction => json['direction']).account = Account.find(json['account_id'])
			s.build_header(:transaction_date => json['transaction_date']).payee = Payee.find_or_new(json['payee'])
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
			case child['transaction_type']
				when 'Basic' then
					category = Category.find_or_new(child['category'])
					category = Category.find_or_new(child['subcategory'], category) unless child['subcategory'].nil? || child['subcategory']['id'].nil?
					self.transaction_splits.build.build_transaction(:amount => child['amount'], :memo => child['memo'], :transaction_type => 'Basic').build_transaction_category.category = category
				else
					direction = child['direction'].eql?('inflow') && 'outflow' || 'inflow' 
					self.transaction_splits.build.build_transaction(:amount => child['amount'], :memo => child['memo'], :transaction_type => 'Subtransfer').build_transaction_account(:direction => direction).account = Account.find(child['account']['id'])
			end
		end
	end

	def update_from_json(json)
		self.amount = json['amount']
		self.memo = json['memo']
		self.transaction_account.direction = json['direction']
		self.header.transaction_date = json['transaction_date']
		self.header.payee = Payee.find_or_new(json['payee'])
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
		transactions = ActiveRecord::Base.connection.execute <<-query
			SELECT					t.id,
											t.transaction_type,
											CASE t.transaction_type
												WHEN 'Basic' THEN CASE WHEN c2.id IS NOT NULL THEN c2.id ELSE c.id END
												WHEN 'Subtransfer' THEN CASE t2.transaction_type WHEN 'Payslip' THEN 'TransferTo' ELSE CASE ta.direction WHEN 'outflow' THEN 'TransferTo' ELSE 'TransferFrom' END END
												ELSE t.transaction_type
											END AS 'category_id',
											CASE t.transaction_type
												WHEN 'Basic' THEN CASE WHEN c2.id IS NOT NULL THEN c2.name ELSE c.name END
												WHEN 'Subtransfer' THEN CASE t2.transaction_type WHEN 'Payslip' THEN 'Transfer To' ELSE CASE ta.direction WHEN 'outflow' THEN 'Transfer To' ELSE 'Transfer From' END END
												ELSE t.transaction_type
											END AS 'category_name',
											CASE 
												WHEN c2.id IS NOT NULL THEN c.id
											END AS 'subcategory_id',
											CASE 
												WHEN c2.id IS NOT NULL THEN c.name
											END AS 'subcategory_name',
											a.id AS 'account_id',
											a.name AS 'account_name',
											t.amount,
											CASE t.transaction_type
												WHEN 'Subtransfer' THEN CASE t2.transaction_type WHEN 'Payslip' THEN 'outflow' ELSE ta.direction END
												ELSE c.direction
											END AS 'direction',
											t.memo
			FROM						transaction_splits ts
			JOIN						transaction_accounts ta ON ta.transaction_id = ts.parent_id
			JOIN						transactions t ON t.id = ts.transaction_id
			JOIN						transactions t2 ON t2.id = ts.parent_id
			LEFT OUTER JOIN	transaction_categories tc ON tc.transaction_id = t.id
			LEFT OUTER JOIN	categories c ON c.id = tc.category_id
			LEFT OUTER JOIN	categories c2 ON c2.id = c.parent_id
			LEFT OUTER JOIN	transaction_accounts ta2 ON ta2.transaction_id = t.id AND ta2.account_id != ta.account_id
			LEFT OUTER JOIN	accounts a ON ta2.account_id = a.id
			WHERE						ts.parent_id = #{self.id}
		query

		# Remap to the desired output format
		transactions.map do |trx|
			{
				:id => trx['id'],
				:transaction_type => trx['transaction_type'],
				:category => {
					:id => trx['category_id'],
					:name => trx['category_name']
				},
				:subcategory => {
					:id => trx['subcategory_id'],
					:name => trx['subcategory_name']
				},
				:account => {
					:id => trx['account_id'],
					:name => trx['account_name']
				},
				:amount => trx['amount'],
				:direction => trx['direction'],
				:memo => trx['memo']
			}
		end
	end
end
