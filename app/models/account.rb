class Account < ActiveRecord::Base
	validates :name, :opening_balance, :presence => true
	validates :account_type, :presence => true, :inclusion => {:in => %w(bank credit cash asset liability investment loan)}
	has_many :transaction_accounts
	has_many :transactions, :through => :transaction_accounts
	belongs_to :related_account, :class_name => 'Account', :foreign_key => 'related_account_id'

	class << self
		def account_list
			# Get the current holding balance of all investment accounts
			investment_accounts = ActiveRecord::Base.connection.execute <<-query
				SELECT					a.related_account_id,
												a.name,
												SUM(h.current_value) as total_value
				FROM						accounts a
				LEFT OUTER JOIN	(	SELECT		a2.id,
																		th.security_id,
																		ROUND(SUM(CASE ta.direction WHEN 'inflow' THEN t.quantity ELSE t.quantity * -1.0 END) * p.price,2) AS current_value
													FROM			accounts a2
													JOIN			transaction_accounts ta ON ta.account_id = a2.id
													JOIN			transactions t ON t.id = ta.transaction_id
													JOIN			transaction_headers th ON th.transaction_id = t.id
													JOIN			(	SELECT		sp.security_id,
																								sp.price
																			FROM			security_prices sp
																			GROUP BY	sp.security_id
																			HAVING		MAX(sp.as_at_date) = sp.as_at_date
																		) p ON th.security_id = p.security_id
													WHERE			t.transaction_type IN ('SecurityInvestment', 'SecurityTransfer', 'SecurityHolding') AND
																		a2.account_type = 'investment'
													GROUP BY	a2.id,
																		th.security_id
													HAVING		current_value > 0
												) AS h ON a.id = h.id
				WHERE						a.account_type = 'investment'
				GROUP BY				a.related_account_id
			query

			# Get the current closing balance of all non-investment accounts
			other_accounts = ActiveRecord::Base.connection.execute <<-query
				SELECT					a.id,
												a.name,
												a.account_type,
												a.opening_balance + ifnull(b.total,0) + ifnull(s.total,0) + ifnull(i.total,0) + ifnull(o.total,0) AS closing_balance
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

				cash_account['name'] = account['name']
				cash_account['account_type'] = 'investment'
				cash_account['closing_balance'] += account['total_value'] || 0
			end

			account_list.values.sort_by {|a| a['account_type']}.group_by {|a| "#{a['account_type'].capitalize} account".pluralize}.each_with_object({}) do |(type,accounts),hash|
				hash[type] = {
					:accounts => accounts.sort_by {|a| a['name']},
					:total => accounts.map {|a| a['closing_balance']}.reduce(:+)
				}
			end

=begin
			# Investment accounts
			investment_accounts = self
				.select("transaction_accounts.account_id, transaction_headers.security_id, SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN quantity ELSE quantity * -1 END) AS total_quantity, security_prices.price")
				.where(:transactions => {:transaction_type => %w(SecurityInvestment SecurityTransfer SecurityHolding)})
				.where(:account_type => 'investment')
				.joins(:transaction_accounts => :transaction)
				.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
				.joins('JOIN security_prices ON transaction_headers.security_id = security_prices.security_id')
				.group('transaction_accounts.account_id, transaction_headers.security_id')
				.having('total_quantity > 0')
				.having('MAX(security_prices.as_at_date) = security_prices.as_at_date')

			# Other accounts
			basic = BasicTransaction
				.select{[account.id, sum(amount).as(total)]}
				.joins{account}
				.joins{category}
				.where{transaction_type.eq 'Basic'}
				.where{account.account_type.not_eq 'investment'}
				.group{account.id}
			# TODO categories.direction.eq 'inflow' ? amount : amount * -1.0

			subtransfer = SubtransferTransaction
				.select{[account.id, sum(amount).as(total)]}
				.joins{account}
				.joins{parent}
				.where{transaction_type.eq 'Subtransfer'}
				.where{account.account_type.not_eq 'investment'}
				.where{parent.transaction_type.in(['Split', 'LoanRepayment', 'Payslip'])}
				.group{account.id}
			# TODO transaction_accounts.direction.eq 'inflow' ? amount : amount * -1

			inflow = TransactionAccount
				.select{[account.id, sum(transaction.amount).as(total)]}
				.joins{account}
				.joins{transaction}
				.where{transaction.transaction_type.in(['Split', 'Payslip', 'Transfer', 'Dividend', 'SecurityInvestment'])}
				.where{direction.eq 'inflow'}
				.where{account.account_type.not_eq 'investment'}
				.group{account.id}

			outflow = TransactionAccount
				.select{[account.id, sum(transaction.amount * -1).as(total)]}
				.joins{account}
				.joins{transaction}
				.where{transaction.transaction_type.in(['Split', 'LoanRepayment', 'Transfer', 'SecurityInvestment'])}
				.where{direction.eq 'outflow'}
				.where{account.account_type.not_eq 'investment'}
				.group{account.id}

			other_accounts = Account
				.select{[name, account_type, opening_balance]} # + ifnull(basic.total,0) + ifnull(subtransfer.total,0) + ifnull(inflow.total,0) + ifnull(outflow.total,0)]}
				.joins{basic.outer}
				.joins{subtransfer.outer}
				.joins{inflow.outer}
				.joins{outflow.outer}
				.where{account_type.eq 'investment'}
				.order{[account_type, name]}
=end
		end
	end

	# Maximum number of transactions to return
	NUM_RESULTS = 100

	def transaction_ledger(as_at = Date.today.to_s)

		# Get the specified number of transactions up to the given date 
		transactions = ActiveRecord::Base.connection.execute <<-query
			SELECT					th.transaction_date,
											CASE
												WHEN th.payee_id IS NOT NULL THEN p.name
												WHEN th.security_id IS NOT NULL THEN s.name
											END AS 'payee_security',
											t.amount,
											ta.direction,
											CASE t.transaction_type
												WHEN 'Basic' THEN COALESCE(c2.name, c.name)
												WHEN 'Subtransfer' THEN 'Transfer'
												ELSE t.transaction_type
											END AS 'category',
											CASE t.transaction_type
												WHEN 'Basic' THEN CASE WHEN c.parent_id IS NOT NULL THEN c.name END
												ELSE a.name
											END AS 'subcategory',
											t.memo
			FROM						transactions t
			JOIN						transaction_accounts ta ON ta.transaction_id = t.id
			LEFT OUTER JOIN	transaction_headers th ON th.transaction_id = t.id
			LEFT OUTER JOIN	payees p ON th.payee_id = p.id
			LEFT OUTER JOIN	securities s ON th.security_id = s.id
			LEFT OUTER JOIN	transaction_categories tc ON tc.transaction_id = t.id
			LEFT OUTER JOIN	categories c ON c.id = tc.category_id
			LEFT OUTER JOIN	categories c2 ON c2.id = c.parent_id
			LEFT OUTER JOIN	transaction_accounts ta2 ON ta2.transaction_id = t.id AND ta2.account_id != ta.account_id
			LEFT OUTER JOIN	accounts a ON ta2.account_id = a.id
			WHERE						ta.account_id = #{self.id} AND
											th.transaction_date <= '#{as_at}'
			ORDER BY				th.transaction_date DESC
			LIMIT						#{NUM_RESULTS}
		query

		# Reverse the results to be in chronological order
		transactions.reverse!

		# Get the date of the oldest transaction
		closing_date = transactions.first['transaction_date']

		# Drop transactions from the closing date
		transactions_ = transactions.drop_while do |trx|
			trx['transaction_date'].eql? closing_date
		end

		[closing_date, transactions_]

=begin
		results = []
		self.transactions.map do |t|
			t = t.becomes("#{t.transaction_type}Transaction".constantize)
			direction, category, subcategory = case t.transaction_type
				when 'Basic' then [t.transaction_account.direction, (t.category.parent.nil? && ((!!t.category && t.category.name) || "") || t.category.parent.name), (t.category.parent.nil? && "" || t.category.name)]
				when 'Transfer', 'SecurityTransfer' then
					if t.source_account && t.source_account.eql?(self)
						[t.source_transaction_account.direction, t.transaction_type, (!!t.destination_account && t.destination_account.name) || ""]
					else
						[t.destination_transaction_account.direction, t.transaction_type, (!!t.source_account && t.source_account.name) || ""]
					end
				when 'Subtransfer' then [t.transaction_account.direction, 'Transfer', t.parent.account.name]
				when 'Split', 'Payslip' then [t.transaction_account.direction, t.transaction_type, ""]
				when 'SecurityInvestment', 'Dividend' then
					if t.investment_account && t.investment_account.eql?(self)
						[t.investment_transaction_account.direction, t.transaction_type, (!!t.cash_account && t.cash_account.name) || ""]
					else
						[t.cash_transaction_account.direction, t.transaction_type, (!!t.investment_account && t.investment_account.name) || ""]
					end
			end

			payee = case t.header
				when PayeeTransactionHeader then (!!t.header.payee && t.header.payee.name) || ""
				when SecurityTransactionHeader then (!!t.header.security && t.header.security.name || "")
			end
			
			{
				:id => t.id,
				:transaction_date => t.header.transaction_date,
				:payee => payee,
				:amount => t.amount,
				:direction => direction,
				:category => category,
				:subcategory => subcategory,
				:memo => t.memo
			}
		end
=end
	end

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

	# Obviously this is a temporary method name....
	def transaction_ledger2(opts)
		as_at = opts[:as_at] || '2400-12-31'
		direction = (!!opts[:direction] && opts[:direction].to_sym || :prev)

		# Get the specified number of transactions up to the given date 
		transactions = ActiveRecord::Base.connection.execute <<-query
			SELECT					t.id,
											t.transaction_type,
											th.transaction_date,
											th.payee_id,
											p.name AS 'payee_name',
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
											ta.direction,
											t.memo
			FROM						transactions t
			JOIN						transaction_accounts ta ON ta.transaction_id = t.id
			LEFT OUTER JOIN	transaction_headers th ON th.transaction_id = t.id
			LEFT OUTER JOIN	payees p ON th.payee_id = p.id
			LEFT OUTER JOIN	securities s ON th.security_id = s.id
			LEFT OUTER JOIN	transaction_categories tc ON tc.transaction_id = t.id
			LEFT OUTER JOIN	categories c ON c.id = tc.category_id
			LEFT OUTER JOIN	categories c2 ON c2.id = c.parent_id
			LEFT OUTER JOIN	transaction_accounts ta2 ON ta2.transaction_id = t.id AND ta2.account_id != ta.account_id
			LEFT OUTER JOIN	accounts a ON ta2.account_id = a.id
			WHERE						ta.account_id = #{self.id} AND
											th.transaction_date #{LEDGER_QUERY_OPTS[direction][:operator]} '#{as_at}'
			ORDER BY				th.transaction_date #{LEDGER_QUERY_OPTS[direction][:order]}
			LIMIT						#{NUM_RESULTS}
		query

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

		[opening_balance, transactions]
	end

	def closing_balance(as_at = Date.today.to_s)
		if self.account_type.eql? 'investment'
			# Get the total quantity of security inflows
			security_quantities = self.transactions
				.select("transaction_headers.security_id, transaction_accounts.direction, SUM(quantity) AS total_quantity")
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
