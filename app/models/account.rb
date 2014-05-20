class Account < ActiveRecord::Base
	validates :name, :opening_balance, :presence => true
	validates :account_type, :presence => true, :inclusion => {:in => %w(bank credit cash asset liability investment loan)}
	validates :status, :inclusion => {:in => %w(open closed)}
	has_many :transaction_accounts
	has_many :transactions, :through => :transaction_accounts
	belongs_to :related_account, :class_name => 'Account', :foreign_key => 'related_account_id'

	include Categorisable

	class << self
		def list
			# Get the current holding balance of all investment accounts
			investment_accounts = ActiveRecord::Base.connection.execute <<-query
				SELECT					accounts.id,
												accounts.related_account_id,
												accounts.name,
												accounts.status,
												SUM(security_holdings.current_value) as total_value
				FROM						accounts
				LEFT OUTER JOIN	(	SELECT		accounts.id,
																		transaction_headers.security_id,
																		ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END) * MAX(latest_prices.price),2) AS current_value
													FROM			accounts
													JOIN			transaction_accounts ON transaction_accounts.account_id = accounts.id
													JOIN			transactions ON transactions.id = transaction_accounts.transaction_id
													JOIN			transaction_headers ON transaction_headers.transaction_id = transactions.id
													JOIN			(	SELECT		security_prices.security_id,
																								security_prices.price
																			FROM			security_prices
																			JOIN			(	SELECT		security_id,
																														MAX(as_at_date) AS as_at_date
																									FROM			security_prices
																									GROUP BY	security_id
																								) latest_price_dates ON security_prices.security_id = latest_price_dates.security_id AND security_prices.as_at_date = latest_price_dates.as_at_date
																		) latest_prices ON transaction_headers.security_id = latest_prices.security_id
													WHERE			transactions.transaction_type IN ('SecurityInvestment', 'SecurityTransfer', 'SecurityHolding') AND
																		transaction_headers.transaction_date IS NOT NULL AND
																		accounts.account_type = 'investment'
													GROUP BY	accounts.id,
																		transaction_headers.security_id
													HAVING		ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END) * MAX(latest_prices.price),2) > 0
												) AS security_holdings ON security_holdings.id = accounts.id
				WHERE						accounts.account_type = 'investment'
				GROUP BY				accounts.id
			query

			# Get the current closing balance of all non-investment accounts
			other_accounts = ActiveRecord::Base.connection.execute <<-query
				SELECT					accounts.id,
												accounts.name,
												accounts.status,
												accounts.account_type,
												accounts.opening_balance + COALESCE(basic_transactions.total,0) + COALESCE(subtransfer_transactions.total,0) + COALESCE(inflow_transactions.total,0) + COALESCE(outflow_transactions.total,0) AS closing_balance
				FROM						accounts
				LEFT OUTER JOIN	(	SELECT		accounts.id,
																		SUM(CASE categories.direction WHEN 'inflow' THEN transactions.amount ELSE transactions.amount * -1.0 END) AS total
													FROM			accounts
													JOIN			transaction_accounts ON transaction_accounts.account_id = accounts.id
													JOIN			transactions ON transactions.id = transaction_accounts.transaction_id
													JOIN			transaction_headers ON transaction_headers.transaction_id = transactions.id
													JOIN			transaction_categories ON transaction_categories.transaction_id = transactions.id
													JOIN			categories ON categories.id = transaction_categories.category_id
													WHERE			transactions.transaction_type = 'Basic' AND
																		transaction_headers.transaction_date IS NOT NULL AND
																		accounts.account_type != 'investment'
													GROUP BY	accounts.id
												) AS basic_transactions ON basic_transactions.id = accounts.id
				LEFT OUTER JOIN	(	SELECT		accounts.id,
																		SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transactions.amount ELSE transactions.amount * -1.0 END) AS total
													FROM			accounts
													JOIN			transaction_accounts ON transaction_accounts.account_id = accounts.id
													JOIN			transactions ON transactions.id = transaction_accounts.transaction_id
													JOIN			transaction_headers ON transaction_headers.transaction_id = transactions.id
													JOIN			transaction_splits ON transaction_splits.transaction_id = transactions.id
													JOIN			transactions parent_transactions ON parent_transactions.id = transaction_splits.parent_id
													WHERE			transactions.transaction_type = 'Subtransfer' AND
																		parent_transactions.transaction_type IN ('Split', 'LoanRepayment', 'Payslip') AND
																		transaction_headers.transaction_date IS NOT NULL AND
																		accounts.account_type != 'investment'
													GROUP BY	accounts.id
												) AS subtransfer_transactions ON subtransfer_transactions.id = accounts.id
				LEFT OUTER JOIN	(	SELECT		accounts.id,
																		SUM(transactions.amount) AS total
													FROM			accounts
													JOIN			transaction_accounts ON transaction_accounts.account_id = accounts.id
													JOIN			transactions ON transactions.id = transaction_accounts.transaction_id
													JOIN			transaction_headers ON transaction_headers.transaction_id = transactions.id
													WHERE			transactions.transaction_type IN ('Split', 'Payslip', 'Transfer', 'Dividend', 'SecurityInvestment') AND
																		transaction_accounts.direction = 'inflow' AND
																		transaction_headers.transaction_date IS NOT NULL AND
																		accounts.account_type != 'investment'
													GROUP BY	accounts.id
												) AS inflow_transactions ON inflow_transactions.id = accounts.id
				LEFT OUTER JOIN	(	SELECT		accounts.id,
																		SUM(transactions.amount * -1.0) AS total
													FROM			accounts
													JOIN			transaction_accounts ON transaction_accounts.account_id = accounts.id
													JOIN			transactions ON transactions.id = transaction_accounts.transaction_id
													JOIN			transaction_headers ON transaction_headers.transaction_id = transactions.id
													WHERE			transactions.transaction_type IN ('Split', 'LoanRepayment', 'Transfer', 'SecurityInvestment') AND
																		transaction_accounts.direction = 'outflow' AND
																		transaction_headers.transaction_date IS NOT NULL AND
																		accounts.account_type != 'investment'
													GROUP BY	accounts.id
												) AS outflow_transactions ON outflow_transactions.id = accounts.id
				WHERE						accounts.account_type != 'investment'
			query

			# Convert the array of accounts to a hash
			account_list = other_accounts.each_with_object({}) do |account, hash|
				hash[account['id']] = account
			end

			# Overlay the investment holding balances on top of the related cash account closing balances
			investment_accounts.each do |account|
				cash_account = account_list[account['related_account_id']]
				next if cash_account.nil? 

				cash_account['id'] = account['id']
				cash_account['name'] = account['name']
				cash_account['status'] = account['status']
				cash_account['account_type'] = 'investment'
				cash_account['closing_balance'] = cash_account['closing_balance'].to_f + account['total_value'].to_f || 0
				cash_account['related_account_id'] = account['related_account_id']
			end

			account_list.values.sort_by {|a| a['account_type']}.group_by {|a| "#{a['account_type'].capitalize} account".pluralize}.each_with_object({}) do |(type,accounts),hash|
				hash[type] = {
					:accounts => accounts.sort_by {|a| a['name']}.map {|a| {
						:id => a['id'].to_i,
						:name => a['name'],
						:status => a['status'],
						:closing_balance => a['closing_balance'].to_f,
						:related_account_id => a['related_account_id'] && a['related_account_id'].to_i
					}},
					:total => accounts.map {|a| a['closing_balance'].to_f}.reduce(:+)
				}
			end

		end
	end

	# Maximum number of transactions to return
	NUM_RESULTS = 300

	LEDGER_QUERY_OPTS = {
		:prev => {
			:operator => '<',
			:order => 'DESC'
		},
		:next => {
			:operator => '>',
			:order => 'ASC'
		}
	}

	def transaction_ledger(opts)
		as_at = opts[:as_at] || '2400-12-31'
		direction = (!!opts[:direction] && opts[:direction].to_sym || :prev)

		# Get the specified number of transactions up to the given date 
		transactions = Transaction
			.select(		"transactions.id",
						 			"transactions.transaction_type",
						 			"transaction_headers.transaction_date",
									"transaction_headers.payee_id",
									"payees.name AS payee_name",
									"transaction_headers.security_id",
									"securities.name AS security_name",
									"categories.id AS category_id",
									"categories.name AS category_name",
									"parent_categories.id AS parent_category_id",
									"parent_categories.name AS parent_category_name",
									"transfer_accounts.id AS transfer_account_id",
									"transfer_accounts.name AS transfer_account_name",
									"transfer_transaction_accounts.status AS transfer_status",
									"transaction_splits.parent_id AS split_parent_id",
									"split_accounts.id AS split_account_id",
									"split_accounts.name AS split_account_name",
									"split_transaction_accounts.status AS split_parent_status",
									"transactions.amount",
									"transaction_headers.quantity",
									"transaction_headers.price",
									"transaction_headers.commission",
									"transaction_accounts.direction",
									"transaction_accounts.status",
									"transactions.memo",
						 			"transaction_flags.memo AS flag") 
			.joins(			"JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id")
			.joins(			"LEFT OUTER JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id")
			.joins(			"LEFT OUTER JOIN payees ON payees.id = transaction_headers.payee_id")
			.joins(			"LEFT OUTER JOIN securities ON securities.id = transaction_headers.security_id")
			.joins(			"LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id")
			.joins(			"LEFT OUTER JOIN categories ON categories.id = transaction_categories.category_id")
			.joins(			"LEFT OUTER JOIN categories parent_categories ON parent_categories.id = categories.parent_id")
			.joins(			"LEFT OUTER JOIN transaction_accounts transfer_transaction_accounts ON transfer_transaction_accounts.transaction_id = transactions.id AND transfer_transaction_accounts.account_id != transaction_accounts.account_id")
			.joins(			"LEFT OUTER JOIN accounts transfer_accounts ON transfer_accounts.id = transfer_transaction_accounts.account_id")
			.joins(			"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id")
			.joins(			"LEFT OUTER JOIN transaction_accounts split_transaction_accounts ON split_transaction_accounts.transaction_id = transaction_splits.parent_id")
			.joins(			"LEFT OUTER JOIN accounts split_accounts ON split_accounts.id = split_transaction_accounts.account_id")
			.joins(			"LEFT OUTER JOIN transaction_flags ON transaction_flags.transaction_id = transactions.id")
			.where(			"transaction_accounts.account_id = ?", self.id)
			.where(			"transaction_headers.transaction_date #{LEDGER_QUERY_OPTS[direction][:operator]} ?", as_at)
			.order(			"transaction_headers.transaction_date #{LEDGER_QUERY_OPTS[direction][:order]}",
									"transactions.id #{LEDGER_QUERY_OPTS[direction][:order]}")
			.limit(			NUM_RESULTS)

		# Set to an empty array if we got no results
		transactions = [] if transactions.nil?

		# Have we reached the end of the transactions (in this direction)?
		at_end = transactions.size < NUM_RESULTS

		# Get the date of the last transaction in the results
		closing_date = transactions.last['transaction_date'] unless at_end

		# If going backwards, reverse the results to be in chronological order
		transactions.reverse! if direction.eql? :prev

		# If we're not at the end, drop any transactions for the last date so that we're only dealing with full days
		unless at_end
			# Drop transactions from the closing date
			transactions_ = transactions.drop_while do |trx|
				trx['transaction_date'].eql? closing_date
			end

			transactions = transactions_
		end

		# The opening balance for this batch of transactions is either:
		# a) the account's opening balance (if we've gone backwards and reached the first transaction for the account)
		# b) the account's closing balance as at the closing_date (if we've gone backwards)
		# c) the account's closing balance as at the passed date (if we've gone forwards)
		opening_balance = if direction.eql? :prev
			at_end ? self.opening_balance : self.closing_balance(closing_date)
		else
			opening_balance = self.closing_balance as_at
		end

		# If we're only interested in unreconciled transactions, sum & drop all reconciled ones
		if !!opts[:unreconciled] && opts[:unreconciled].eql?('true')
			opening_balance = transactions.select {|trx| trx['status'].eql? 'Reconciled'}.reduce(opening_balance) do |total,trx|
				total + (trx['amount'] * (trx['direction'].eql?('inflow') ? 1 : -1))
			end

			transactions_ = transactions.delete_if do |trx|
				trx['status'].eql? 'Reconciled'
			end

			transactions = transactions_
		end
			
		# Remap to the desired output format
		transactions.map! do |trx|
			{
				:id => trx['id'],
				:transaction_type => trx['transaction_type'],
				:transaction_date => trx['transaction_date'],
				:payee => {
					:id => trx['payee_id'],
					:name => trx['payee_name']
				},
				:security => {
					:id => trx['security_id'],
					:name => trx['security_name']
				},
				:category => self.class.transaction_category(trx, self.account_type),
				:subcategory => self.class.basic_subcategory(trx),
				:account => {
					:id => (trx['transaction_type'].eql?('Subtransfer') && trx['split_account_id'] || trx['transfer_account_id']),
					:name => (trx['transaction_type'].eql?('Subtransfer') && trx['split_account_name'] || trx['transfer_account_name'])
				},
				:parent_id => trx['split_parent_id'],
				:amount => trx['amount'],
				:quantity => trx['quantity'],
				:commission => trx['commission'],
				:price => trx['price'],
				:direction => trx['direction'],
				:status => trx['status'],
				:related_status => (trx['transaction_type'].eql?('Subtransfer') && trx['split_parent_status'] || trx['transfer_status']),
				:memo => trx['memo'],
				:flag => trx['flag']
			}
		end

		[opening_balance, transactions, at_end]
	end

	def closing_balance(as_at = Date.today.to_s)
		if self.account_type.eql? 'investment'
			# Get the total quantity of security inflows
			security_quantities = self.transactions
				.select(	"transaction_headers.security_id, transaction_accounts.direction, SUM(transaction_headers.quantity) AS total_quantity")
				.where(		:transaction_type => %w(SecurityInvestment SecurityTransfer SecurityHolding))
				.joins(		"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id")
				.where(		"transaction_headers.transaction_date <= ?", as_at)
				.where(		"transaction_headers.transaction_date IS NOT NULL")
				.group(		"transaction_headers.security_id",
									"transaction_accounts.direction")

			# Reduce to a unique set of securities with the current quantity held
			securities = {}
			security_quantities.each do |s|
				securities[s.security_id] = 0 unless securities.has_key? s.security_id
				securities[s.security_id] += s.total_quantity * (s.direction.eql?('inflow') ? 1 : -1)
			end

			# Calculate the current value of the securities held
			total_security_value = securities.collect{|(security,qty)|Security.find(security).price(as_at) * qty}.reduce(:+)
			total_security_value = 0 if total_security_value.nil?

			# Add the balance from the associated cash account
			total_security_value + self.related_account.closing_balance
		else
			totals = []

			# Get the total Basic transactions
			totals += self.transactions
				.select(	"categories.direction, SUM(transactions.amount) AS total_amount")
				.joins(		"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id")
				.joins(		"JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id")
				.joins(		"JOIN categories ON transaction_categories.category_id = categories.id")
				.where(		:transaction_type => 'Basic')
				.where(		"transaction_headers.transaction_date <= ?", as_at)
				.where(		"transaction_headers.transaction_date IS NOT NULL")
				.group(		"categories.direction")

			# Get the total Subtransfer transactions
			totals += self.transactions
				.select(	"transaction_accounts.direction, SUM(transactions.amount) AS total_amount")
				.joins(		"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id")
				.joins(		"JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id")
				.joins(		"JOIN transactions t2 ON t2.id = transaction_splits.parent_id")
				.where(		:transaction_type => 'Subtransfer')
				.where(		"transaction_headers.transaction_date <= ?", as_at)
				.where(		"transaction_headers.transaction_date IS NOT NULL")
				.where(		"t2.transaction_type = 'Split' or t2.transaction_type = 'LoanRepayment' or t2.transaction_type = 'Payslip'")
				.group('transaction_accounts.direction')

			# Get the total other inflows
			total_inflows = self.transactions
				.where(		:transaction_type => %w(Split Payslip Transfer Dividend SecurityInvestment))
				.joins(		"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id")
				.where(		"transaction_headers.transaction_date <= ?", as_at)
				.where(		"transaction_headers.transaction_date IS NOT NULL")
				.where(		:transaction_accounts => {:direction => 'inflow'})
				.sum(			"amount")

			# Get the total other outflows
			total_outflows = self.transactions
				.where(		:transaction_type => %w(Split LoanRepayment Transfer SecurityInvestment))
				.joins(		"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id")
				.where(		"transaction_headers.transaction_date <= ?", as_at)
				.where(		"transaction_headers.transaction_date IS NOT NULL")
				.where(		:transaction_accounts => {:direction => 'outflow'})
				.sum(			"amount")
			totals.each do |t|
				total_outflows += t.total_amount if t.direction.eql? 'outflow'
				total_inflows += t.total_amount if t.direction.eql? 'inflow'
			end

			self.opening_balance + total_inflows - total_outflows
		end
	end

	def num_transactions(as_at)
		self.transactions
			.joins(	"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id")
			.where(	"transaction_headers.transaction_date <= ?", as_at)
			.where(		"transaction_headers.transaction_date IS NOT NULL")
			.count
	end

	def reconcile
		# Mark all cleared transactions for the account as reconciled
		self.transaction_accounts
			.where(:status => 'Cleared')
			.update_all(:status => 'Reconciled')
	end

	def as_json(options={})
		super :only => [:id, :name, :account_type, :opening_balance, :status]
	end
end
