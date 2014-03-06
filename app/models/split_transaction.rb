class SplitTransaction < PayeeCashTransaction
	has_one :transaction_account, :foreign_key => 'transaction_id', :dependent => :destroy
	has_one :account, :through => :transaction_account
	has_many :transaction_splits, :foreign_key => 'parent_id', :inverse_of => :parent, :dependent => :destroy
	has_many :subtransactions, -> { where :transaction_type => 'Basic' }, :class_name => 'Subtransaction', :through => :transaction_splits, :source => :transaction
	has_many :subtransfers, -> { where :transaction_type =>'Subtransfer' }, :class_name => 'SubtransferTransaction', :through => :transaction_splits, :source => :transaction
	after_initialize do |t|
		t.transaction_type = 'Split'
	end

	def children
		# Get the child transactions
		transactions = ActiveRecord::Base.connection.execute <<-query
			SELECT					t.id,
											t.transaction_type,
											CASE t.transaction_type
												WHEN 'Basic' THEN CASE WHEN c2.id IS NOT NULL THEN c2.id ELSE c.id END
												WHEN 'Subtransfer' THEN 'Transfer'
												ELSE t.transaction_type
											END AS 'category_id',
											CASE t.transaction_type
												WHEN 'Basic' THEN CASE WHEN c2.id IS NOT NULL THEN c2.name ELSE c.name END
												WHEN 'Subtransfer' THEN 'Transfer'
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
												WHEN 'Subtransfer' THEN ta2.direction
												ELSE c.direction
											END AS 'direction',
											t.memo
			FROM						transaction_splits ts
			JOIN						transaction_accounts ta ON ta.transaction_id = ts.parent_id
			JOIN						transactions t ON t.id = ts.transaction_id
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
