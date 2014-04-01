class Account < ActiveRecord::Base
	validates :name, :opening_balance, :presence => true
	validates :account_type, :presence => true, :inclusion => {:in => %w(bank credit cash asset liability investment loan)}
	has_many :transaction_accounts
	has_many :transactions, :through => :transaction_accounts
	belongs_to :related_account, :class_name => 'Account', :foreign_key => 'related_account_id'

	include Categorisable

	class << self
		def account_list
			# Get the current holding balance of all investment accounts
			investment_accounts = ActiveRecord::Base.connection.execute <<-query
				SELECT					a.id,
												a.related_account_id,
												a.name,
												SUM(h.current_value) as total_value
				FROM						accounts a
				LEFT OUTER JOIN	(	SELECT		a2.id,
																		th.security_id,
																		ROUND(SUM(CASE ta.direction WHEN 'inflow' THEN th.quantity ELSE th.quantity * -1.0 END) * MAX(p.price),2) AS current_value
													FROM			accounts a2
													JOIN			transaction_accounts ta ON ta.account_id = a2.id
													JOIN			transactions t ON t.id = ta.transaction_id
													JOIN			transaction_headers th ON th.transaction_id = t.id
													JOIN			(	SELECT		sp.security_id,
																								sp.price
																			FROM			security_prices sp
																			JOIN			(	SELECT		security_id,
																														MAX(as_at_date) AS as_at_date
																									FROM			security_prices
																									GROUP BY	security_id
																								) d ON sp.security_id = d.security_id AND sp.as_at_date = d.as_at_date
																		) p ON th.security_id = p.security_id
													WHERE			t.transaction_type IN ('SecurityInvestment', 'SecurityTransfer', 'SecurityHolding') AND
																		a2.account_type = 'investment'
													GROUP BY	a2.id,
																		th.security_id
													HAVING		ROUND(SUM(CASE ta.direction WHEN 'inflow' THEN th.quantity ELSE th.quantity * -1.0 END) * MAX(p.price),2) > 0
												) AS h ON a.id = h.id
				WHERE						a.account_type = 'investment'
				GROUP BY				a.id
			query

			# Get the current closing balance of all non-investment accounts
			other_accounts = ActiveRecord::Base.connection.execute <<-query
				SELECT					a.id,
												a.name,
												a.account_type,
												a.opening_balance + COALESCE(b.total,0) + COALESCE(s.total,0) + COALESCE(i.total,0) + COALESCE(o.total,0) AS closing_balance
				FROM						accounts a
				LEFT OUTER JOIN	(	SELECT		a.id,
																		SUM(CASE c.direction WHEN 'inflow' THEN t.amount ELSE t.amount * -1.0 END) AS total
													FROM			accounts a
													JOIN			transaction_accounts ta ON ta.account_id = a.id
													JOIN			transactions t ON t.id = ta.transaction_id
													JOIN			transaction_categories tc ON tc.transaction_id = t.id
													JOIN			categories c ON c.id = tc.category_id
													WHERE			t.transaction_type = 'Basic' AND
																		a.account_type != 'investment'
													GROUP BY	a.id
												) AS b ON a.id = b.id
				LEFT OUTER JOIN	(	SELECT		a.id,
																		SUM(CASE ta.direction WHEN 'inflow' THEN t.amount ELSE t.amount * -1.0 END) AS total
													FROM			accounts a
													JOIN			transaction_accounts ta ON ta.account_id = a.id
													JOIN			transactions t ON t.id = ta.transaction_id
													JOIN			transaction_splits ts ON ts.transaction_id = t.id
													JOIN			transactions t2 ON t2.id = ts.parent_id
													WHERE			t.transaction_type = 'Subtransfer' AND
																		t2.transaction_type IN ('Split', 'LoanRepayment', 'Payslip') AND
																		a.account_type != 'investment'
													GROUP BY	a.id
												) AS s ON a.id = s.id
				LEFT OUTER JOIN	(	SELECT		a.id,
																		SUM(t.amount) AS total
													FROM			accounts a
													JOIN			transaction_accounts ta ON ta.account_id = a.id
													JOIN			transactions t ON t.id = ta.transaction_id
													WHERE			t.transaction_type IN ('Split', 'Payslip', 'Transfer', 'Dividend', 'SecurityInvestment') AND
																		ta.direction = 'inflow' AND
																		a.account_type != 'investment'
													GROUP BY	a.id
												) AS i ON a.id = i.id
				LEFT OUTER JOIN	(	SELECT		a.id,
																		SUM(t.amount * -1.0) AS total
													FROM			accounts a
													JOIN			transaction_accounts ta ON ta.account_id = a.id
													JOIN			transactions t ON t.id = ta.transaction_id
													WHERE			t.transaction_type IN ('Split', 'LoanRepayment', 'Transfer', 'SecurityInvestment') AND
																		ta.direction = 'outflow' AND
																		a.account_type != 'investment'
													GROUP BY	a.id
												) AS o ON a.id = o.id
				WHERE						a.account_type != 'investment'
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
				cash_account['account_type'] = 'investment'
				cash_account['closing_balance'] = cash_account['closing_balance'].to_f + account['total_value'].to_f || 0
				cash_account['related_account_id'] = account['related_account_id']
			end

			account_list.values.sort_by {|a| a['account_type']}.group_by {|a| "#{a['account_type'].capitalize} account".pluralize}.each_with_object({}) do |(type,accounts),hash|
				hash[type] = {
					:accounts => accounts.sort_by {|a| a['name']}.map {|a| {:id => a['id'], :name => a['name'], :closing_balance => a['closing_balance'], :related_account_id => a['related_account_id']}},
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
									"split_accounts.id AS split_account_id",
									"split_accounts.name AS split_account_name",
									"transactions.amount",
									"transaction_headers.quantity",
									"transaction_headers.price",
									"transaction_headers.commission",
									"transaction_accounts.direction",
									"transactions.memo")
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
				:category => self.transaction_category(trx),
				:subcategory => self.basic_subcategory(trx),
				:account => {
					:id => (trx['transaction_type'].eql?('Subtransfer') && trx['split_account_id'] || trx['transfer_account_id']),
					:name => (trx['transaction_type'].eql?('Subtransfer') && trx['split_account_name'] || trx['transfer_account_name'])
				},
				:amount => trx['amount'],
				:quantity => trx['quantity'],
				:commission => trx['commission'],
				:price => trx['price'],
				:direction => trx['direction'],
				:memo => trx['memo']
			}
		end

		[opening_balance, transactions, at_end]
	end

	def closing_balance(as_at = Date.today.to_s)
		if self.account_type.eql? 'investment'
			# Get the total quantity of security inflows
			security_quantities = self.transactions
				.select("transaction_headers.security_id, transaction_accounts.direction, SUM(transaction_headers.quantity) AS total_quantity")
				.where(:transaction_type => %w(SecurityInvestment SecurityTransfer SecurityHolding))
				.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
				.where("transaction_headers.transaction_date <= '#{as_at}'")
				.group("transaction_headers.security_id, transaction_accounts.direction")

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
				.select('categories.direction, SUM(amount) AS total_amount')
				.where(:transaction_type => 'Basic')
				.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
				.joins('JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id')
				.joins('JOIN categories ON transaction_categories.category_id = categories.id')
				.where("transaction_headers.transaction_date <= '#{as_at}'")
				.group('categories.direction')

			# Get the total Subtransfer transactions
			totals += self.transactions
				.select('transaction_accounts.direction, SUM(transactions.amount) AS total_amount')
				.where(:transaction_type => 'Subtransfer')
				.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
				.joins('JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id')
				.joins('JOIN transactions t2 ON t2.id = transaction_splits.parent_id')
				.where("transaction_headers.transaction_date <= '#{as_at}'")
				.where("t2.transaction_type = 'Split' or t2.transaction_type = 'LoanRepayment' or t2.transaction_type = 'Payslip'")
				.group('transaction_accounts.direction')

			# Get the total other inflows
			total_inflows = self.transactions
				.where(:transaction_type => %w(Split Payslip Transfer Dividend SecurityInvestment))
				.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
				.where("transaction_headers.transaction_date <= '#{as_at}'")
				.where(:transaction_accounts => {:direction => 'inflow'})
				.sum("amount")

			# Get the total other outflows
			total_outflows = self.transactions
				.where(:transaction_type => %w(Split LoanRepayment Transfer SecurityInvestment))
				.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
				.where("transaction_headers.transaction_date <= '#{as_at}'")
				.where(:transaction_accounts => {:direction => 'outflow'})
				.sum("amount")
			totals.each do |t|
				total_outflows += t.total_amount if t.direction.eql? 'outflow'
				total_inflows += t.total_amount if t.direction.eql? 'inflow'
			end

			self.opening_balance + total_inflows - total_outflows
		end
	end

	def num_transactions(as_at)
		self.transactions.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id').where("transaction_headers.transaction_date <= '#{as_at}'").count
	end

	def as_json(options={})
		super :only => [:id, :name, :account_type, :opening_balance]
	end
end
