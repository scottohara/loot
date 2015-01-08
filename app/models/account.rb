class Account < ActiveRecord::Base
	validates :name, :opening_balance, :presence => true
	validates :account_type, :presence => true, :inclusion => {:in => %w(bank credit cash asset liability investment loan)}
	validates :status, :inclusion => {:in => %w(open closed)}
	has_many :transaction_accounts
	has_many :transactions, :through => :transaction_accounts, :source => :trx do
		def for_ledger(opts)
			joins([	"LEFT OUTER JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id"])
		end

		def for_closing_balance(opts)
			joins("JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id")
		end

		def for_basic_closing_balance(opts)
			joins([	"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id",
							"JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id"])
		end
	end
	belongs_to :related_account, :class_name => 'Account', :foreign_key => 'related_account_id'

	include Transactable

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
													HAVING		ABS(ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END) * MAX(latest_prices.price),2)) > 0
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

	def reconcile
		# Mark all cleared transactions for the account as reconciled
		self.transaction_accounts
			.where(:status => 'Cleared')
			.update_all(:status => 'Reconciled')
	end

	def as_json(options={})
		# Defer to serializer
		AccountSerializer.new(self, options).as_json
	end
end
