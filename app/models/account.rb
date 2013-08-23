class Account < ActiveRecord::Base
	attr_accessible :name, :account_type, :opening_balance
	validates :name, :opening_balance, :presence => true
	validates :account_type, :presence => true, :inclusion => {:in => %w(bank loan)}
	has_many :transaction_accounts
	has_many :transactions, :through => :transaction_accounts

	def transaction_ledger(as_at)
		results = []
		self.transactions.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id').where("transaction_headers.transaction_date <= '#{as_at}'").each do |t|
				 t = t.becomes("#{t.transaction_type}Transaction".constantize)
				 direction, category, subcategory = case t.transaction_type
				 when 'Basic' then [t.transaction_account.direction, (t.category.parent.nil? && ((!!t.category && t.category.name) || "") || t.category.parent.name), (t.category.parent.nil? && "" || t.category.name)]
				 when 'Transfer' then
							if t.source_account && t.source_account.eql?(self)
									 [t.source_transaction_account.direction, t.transaction_type, (!!t.destination_account && t.destination_account.name) || ""]
							else
									 [t.destination_transaction_account.direction, t.transaction_type, (!!t.source_account && t.source_account.name) || ""]
							end
				 when 'Subtransfer' then [t.transaction_account.direction, 'Transfer', t.parent.account.name]
				 when 'Split', 'Payslip' then [t.transaction_account.direction, t.transaction_type, ""]
				 end
				
				 results << {:id => t.id, :transaction_date => t.header.transaction_date, :payee => (!!t.header.payee && t.header.payee.name) || "", :amount => t.amount, :direction => direction, :category => category, :subcategory => subcategory, :memo => t.memo }
		end
		results
	end		

	def closing_balance(as_at)
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

		self.opening_balance + total_basic_inflows - total_basic_outflows + total_transfer_inflows - total_transfer_outflows + total_split_inflows - total_split_outflows
	end

	def num_transactions(as_at)
		self.transactions.joins('JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id').where("transaction_headers.transaction_date <= '#{as_at}'").count
	end
end
