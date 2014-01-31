class Account < ActiveRecord::Base
	validates :name, :opening_balance, :presence => true
	validates :account_type, :presence => true, :inclusion => {:in => %w(bank credit cash asset liability investment loan)}
	has_many :transaction_accounts
	has_many :transactions, :through => :transaction_accounts
	belongs_to :related_account, :class_name => 'Account', :foreign_key => 'related_account_id'

	def transaction_ledger(as_at, start_from='1998-01-01')
		results = []
		self.transactions.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id').where("transaction_headers.transaction_date BETWEEN '#{start_from}' AND '#{as_at}'").each do |t|
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
				
				 results << {:id => t.id, :transaction_date => t.header.transaction_date, :payee => payee, :amount => t.amount, :direction => direction, :category => category, :subcategory => subcategory, :memo => t.memo }
		end
		results
	end		

	def closing_balance(as_at = Date.today.to_s)
		if self.account_type.eql? 'investment'
			# Get the total quantity of security inflows
			security_quantities = self.transactions
											.select("transaction_headers.security_id, transaction_accounts.direction, SUM(quantity) AS total_quantity")
											.where(:transaction_type => %w(SecurityInvestment SecurityTransfer))
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
			# Get the total Basic inflows
			total_basic_inflows = self.transactions
											.where(:transaction_type => 'Basic')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.joins('JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id')
											.joins('JOIN categories ON transaction_categories.category_id = categories.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where("categories.direction = 'inflow'")
											.sum("amount")	

			# Get the total Basic outflows
			total_basic_outflows = self.transactions
											.where(:transaction_type => 'Basic')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.joins('JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id')
											.joins('JOIN categories ON transaction_categories.category_id = categories.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where("categories.direction = 'outflow'")
											.sum("amount")	

			# Get the total Transfer inflows
			total_transfer_inflows = self.transactions
											.where(:transaction_type => 'Transfer')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'inflow'})
											.sum("amount")	

			# Get the total Transfer outflows
			total_transfer_outflows = self.transactions
											.where(:transaction_type => 'Transfer')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'outflow'})
											.sum("amount")	

			# Get the total Split / Payslip inflows
			total_split_inflows = self.transactions
											.where(:transaction_type => %w(Split Payslip))
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'inflow'})
											.sum("amount")	

			# Get the total Split / Loan Repayment outflows
			total_split_outflows = self.transactions
											.where(:transaction_type => %w(Split LoanRepayment))
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'outflow'})
											.sum("amount")	

			# Get the total Subtransfer inflows (where parent is a Split or Loan Repayment)
			total_subtransfer_inflows = self.transactions
											.where(:transaction_type => 'Subtransfer')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.joins('JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id')
											.joins('JOIN transactions t2 ON t2.id = transaction_splits.parent_id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'inflow'})
											.where("t2.transaction_type = 'Split' or t2.transaction_type = 'LoanRepayment' or t2.transaction_type = 'Payslip'")
											.sum("amount")	

			# Get the total Subtransfer outflows (where parent is a Split or Loan Repayment)
			total_subtransfer_outflows = self.transactions
											.where(:transaction_type => 'Subtransfer')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.joins('JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id')
											.joins('JOIN transactions t2 ON t2.id = transaction_splits.parent_id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'outflow'})
											.where("t2.transaction_type = 'Split' or t2.transaction_type = 'LoanRepayment' or t2.transaction_type = 'Payslip'")
											.sum("amount")	

			# Get the total Dividend inflows
			total_dividend_inflows = self.transactions
											.where(:transaction_type => 'Dividend')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'inflow'})
											.sum("amount")	
		
			# Get the total Security Investment inflows
			total_security_investment_inflows = self.transactions
											.where(:transaction_type => 'SecurityInvestment')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'inflow'})
											.sum("amount")	
		
			# Get the total Security Investment outflows
			total_security_investment_outflows = self.transactions
											.where(:transaction_type => 'SecurityInvestment')
											.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id')
											.where("transaction_headers.transaction_date <= '#{as_at}'")
											.where(:transaction_accounts => {:direction => 'outflow'})
											.sum("amount")	
		
			self.opening_balance + total_basic_inflows - total_basic_outflows + total_transfer_inflows - total_transfer_outflows + total_split_inflows - total_split_outflows + total_subtransfer_inflows - total_subtransfer_outflows + total_dividend_inflows + total_security_investment_inflows - total_security_investment_outflows
		end
	end

	def num_transactions(as_at)
		self.transactions.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id').where("transaction_headers.transaction_date <= '#{as_at}'").count
	end
end
