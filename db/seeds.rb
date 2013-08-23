# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

require 'csv'

# Temporary hashes for lookups etc. during load
@tmp_accounts = {}
@tmp_payees = {}
@tmp_categories = {}
@tmp_splits = {}
@tmp_subtransactions = []
@tmp_transfers = {}
@tmp_transactions = {}

def progress(action, count, type)
	reset_line = "\r\e[0K"
	print "#{reset_line}#{action} #{count} #{type}".pluralize $.
end

# Accounts
def load_accounts
	print "Deleting existing accounts..."
	Account.destroy_all
	puts "done"

	CSV.foreach File.join(Dir.home, 'Documents', 'csv', 'ACCT-rows.csv'), :headers => true do |row|
		@tmp_accounts[row['hacct']] = Account.create(:name => row['szFull'], :account_type => 'bank', :opening_balance => row['amtOpen']).id
		progress "Loaded", $., "account" if $. % 10 == 0
	end
	progress "Loaded", $., "account"
	2.times { puts }
end

# Payees
def load_payees
	print "Deleting existing payees..."
	Payee.destroy_all
	puts "done"

	CSV.foreach File.join(Dir.home, 'Documents', 'csv', 'PAY-rows.csv'), :headers => true do |row|
		@tmp_payees[row['hpay']] = Payee.create(:name => row['szFull']).id
		progress "Loaded", $., "payee" if $. % 10 == 0
	end
	progress "Loaded", $., "payee"
	2.times { puts }
end

# Categories
def load_categories
	print "Deleting existing categories..."
	Category.destroy_all
	puts "done"

	CSV.foreach File.join(Dir.home, 'Documents', 'csv', 'CAT-rows.csv'), :headers => true do |row|
		@tmp_categories[row['hcat']] = { :type => row['hct'], :name => row['szFull'], :level => row['nLevel'], :parent => row['hcatParent'] }
	end

	# Select the top level INCOME/EXPENSE items
	income = @tmp_categories.select do |key, value|
		value[:level].eql?('0') && value[:name].eql?('INCOME')
	end

	expense = @tmp_categories.select do |key, value|
		value[:level].eql?('0') && value[:name].eql?('EXPENSE')
	end

	# Income categories
	income.each_key do |id|
		# Get the list of categories that have this parent
		categories = subcategories id

		# Create each one
		categories.sort_by {|k,v| v[:name]}.each do |catid, category|
			create_category catid, category[:name], 'inflow'
		end
	end

	# Expense categories
	expense.each_key do |id|
		# Get the list of categories that have this parent
		categories = subcategories id

		# Create each one
		categories.sort_by {|k,v| v[:name]}.each do |catid, category|
			create_category catid, category[:name], 'outflow'
		end
	end

	puts "Loaded #{@tmp_categories.length} category".pluralize @tmp_categories.length
	puts
end

def subcategories(id)
	@tmp_categories.select do |key, value|
		value[:parent].eql? id
	end
end

def create_category(id, name, direction)
	# Create the new category
	c = Category.new(:name => name, :direction => direction)

	# Get the list of categories that have this parent
	subcats = subcategories id

	# Create the subcategories
	subcats.sort_by {|k,v| v[:name]}.each do |catid, category|
		c.children.build(:name => category[:name], :direction => direction)
	end

	# Save the category (and it's children)
	c.save

	# Update the ids in our temporary hash
	@tmp_categories[id][:id] = c.id
	subcats.sort_by {|k,v| v[:name]}.each_with_index do |(catid, category), index|
		@tmp_categories[catid][:id] = c.children[index].id
	end
end

#Transactions
def load_transactions
	print "Deleting existing transactions..."
	Transaction.destroy_all
	puts "done"
	print "Deleting existing transaction accounts..."
	TransactionAccount.delete_all
	puts "done"
	print "Deleting existing transaction headers..."
	TransactionHeader.delete_all
	puts "done"
	print "Deleting existing transaction categories..."
	TransactionCategory.delete_all
	puts "done"
	print "Deleting existing transaction splits..."
	TransactionSplit.delete_all
	puts "done"

	CSV.foreach File.join(Dir.home, 'Documents', 'csv', 'TRN_SPLIT-rows.csv'), :headers => true do |row|
		@tmp_splits[row['htrnParent']] = [] unless @tmp_splits.has_key? row['htrnParent']
		@tmp_splits[row['htrnParent']] << row['htrn']
		@tmp_subtransactions << row['htrn']
		progress "Loaded", $., "split" if $. % 10 == 0
	end
	progress "Loaded", $., "split"
	puts

	CSV.foreach File.join(Dir.home, 'Documents', 'csv', 'TRN_XFER-rows.csv'), :headers => true do |row|
		@tmp_transfers[row['htrnLink']] = row['htrnFrom']
		progress "Loaded", $., "transfer" if $. % 10 == 0
	end
	progress "Loaded", $., "transfer"
	puts

	CSV.foreach File.join(Dir.home, 'Documents', 'csv', 'TRN-rows.csv'), {:headers => true, :encoding => 'ISO-8859-1:UTF-8'} do |row|
		@tmp_transactions[row['htrn']] = { :id => row['htrn'], :account => @tmp_accounts[row['hacct']], :transaction_date => row['dt'], :amount => row['amt'].to_f.abs, :memo => row['mMemo'], :payee => @tmp_payees[row['lHpay']], :category => ((!row['hcat'].nil?) && @tmp_categories[row['hcat']][:id]), :grftt => row['grftt'] }

		@tmp_transactions[row['htrn']][:type] = case
			# Payslip is simply any row where 'ps' is 1
			when row['ps'].eql?('1') then 'payslip'

			# Subtransfers are any rows where 'ps' is 0 and the row is both part of a transfer and a child of a split
			when row['ps'].eql?('0') && (@tmp_transfers.has_key?(row['htrn']) || @tmp_transfers.has_value?(row['htrn'])) && @tmp_subtransactions.include?(row['htrn']) then 'subtransfer'

			# Transfers out are any rows where 'ps' is 0 and the row is part of a transfer and the other side is not a child of a split and the amount is negative
			when row['ps'].eql?('0') && @tmp_transfers.has_key?(row['htrn']) && !@tmp_subtransactions.include?(@tmp_transfers[row['htrn']]) && row['amt'].to_f < 0 then 'transfer_out'

			# Transfers in are any rows where 'ps' is 0 and the row is part of a transfer and the other side is not a child of a split and the amount is positive
			when row['ps'].eql?('0') && @tmp_transfers.has_key?(row['htrn']) && !@tmp_subtransactions.include?(@tmp_transfers[row['htrn']]) && row['amt'].to_f >= 0 then 'transfer_in'

			# Subtransactions are any rows where 'ps' is 2, or 'ps' is 0 and the row is a child of a split
			when row['ps'].eql?('2') || (row['ps'].eql?('0') && @tmp_subtransactions.include?(row['htrn'])) then 'subtransaction'

			# Payslip before tax is simply any row where 'ps' is 3
			when row['ps'].eql?('3') then 'payslip_beforetax'

			# Payslip tax is simply any row where 'ps' is 4
			when row['ps'].eql?('4') then 'payslip_tax'

			# LoanRepayment is simply any row where 'ps' is 5
			when row['ps'].eql?('5') then 'loanrepayment'

			# Splits out are any rows where 'ps' is 0 and is the parent in a split and the amount is negative
			when row['ps'].eql?('0') && @tmp_splits.has_key?(row['htrn']) && row['amt'].to_f < 0 then 'split_out'

			# Splits in are any rows where 'ps' is 0 and is the parent in a split and the amount is positive
			when row['ps'].eql?('0') && @tmp_splits.has_key?(row['htrn']) && row['amt'].to_f >= 0 then 'split_in'

			# Basic is any row where 'ps' is 0 and the row is not part of a split or a transfer
			when row['ps'].eql?('0') && !@tmp_splits.has_key?(row['htrn']) && !@tmp_subtransactions.include?(row['htrn']) && !@tmp_transfers.has_key?(row['htrn']) && !@tmp_transfers.has_value?(row['htrn']) then 'basic'
		end
		progress "Prepared", $., "transaction" if $. % 10 == 0
	end
	progress "Prepared", $., "transaction"
	puts

	@tmp_transactions.sort_by {|k,v| Date.parse v[:transaction_date]}.each_with_index do |(id, trx), index|
		begin
			if trx[:grftt].to_i > 100
				puts "Skipping transaction on #{trx[:transaction_date]} for $#{trx[:amount]} with grftt of #{trx[:grftt]}"
			else
				self.send "create_#{trx[:type]}_transaction".to_sym, trx unless trx[:type].nil?
				progress "Loaded", index, "transaction"
			end
		rescue
			p trx
			raise
		end
	end
	progress "Loaded", @tmp_transactions.length, "transaction"
	puts
end

def create_basic_transaction(trx)
	# Basic Transaction
	category = Category.find(trx[:category]) unless trx[:category].nil?
	s = BasicTransaction.new(:amount => trx[:amount], :memo => trx[:memo])
	s.build_transaction_account(:direction => (!!category && category.direction) || nil).account = (!!trx[:account] && Account.find(trx[:account])) || nil
	s.build_header(:transaction_date => trx[:transaction_date]).payee = (!!trx[:payee] && Payee.find(trx[:payee])) || nil
	s.build_transaction_category.category = category
	s.save
end

def create_split_out_transaction(trx)
	create_split_transaction(trx, 'outflow')
end

def create_split_in_transaction(trx)
	create_split_transaction(trx, 'inflow')
end

def create_split_transaction(trx, direction)
	# Split Transaction
	s = SplitTransaction.new(:amount => trx[:amount], :memo => trx[:memo])
	s.build_transaction_account(:direction => direction).account = (!!trx[:account] && Account.find(trx[:account])) || nil
	s.build_header(:transaction_date => trx[:transaction_date]).payee = (!!trx[:payee] && Payee.find(trx[:payee])) || nil

	# Add splits
	@tmp_splits[trx[:id]].each do |trxid|
		subtrx = @tmp_transactions[trxid]
		case subtrx[:type]
			when 'subtransaction' then s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Basic').build_transaction_category.category = (!!subtrx[:category] && Category.find(subtrx[:category])) || nil
			else s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Subtransfer').build_transaction_account(:direction => direction).account = Account.find(subtrx[:account])
		end 
	end
	s.save
end

def create_transfer_out_transaction(trx)
	create_transfer_transaction trx, 'outflow'
end

def create_transfer_in_transaction(trx)
	create_transfer_transaction trx, 'inflow'
end

def create_transfer_transaction(trx, direction)
	other_side = @tmp_transactions[@tmp_transfers[trx[:id]]]
	other_direction = direction.eql?('inflow') ? 'outflow' : 'inflow'

	s = TransferTransaction.new(:amount => trx[:amount], :memo => trx[:memo])
	s.build_source_transaction_account(:direction => direction).account = (!!trx[:account] && Account.find(trx[:account])) || nil
	s.build_destination_transaction_account(:direction => other_direction).account = (!!other_side[:account] && Account.find(other_side[:account])) || nil
	s.build_header(:transaction_date => trx[:transaction_date]).payee = (!!trx[:payee] && Payee.find(trx[:payee])) || nil
	s.save
end

def create_payslip_transaction(trx)
	# Payslip Transaction
	s = PayslipTransaction.new(:amount => trx[:amount], :memo => trx[:memo])
	s.build_transaction_account(:direction => 'inflow').account = (!!trx[:account] && Account.find(trx[:account])) || nil
	s.build_header(:transaction_date => trx[:transaction_date]).payee = (!!trx[:payee] && Payee.find(trx[:payee])) || nil

	# Add splits
	@tmp_splits[trx[:id]].each do |trxid|
		subtrx = @tmp_transactions[trxid]
		case subtrx[:type]
			when 'subtransaction' || 'payslip_before_tax' || 'payslip_tax' then s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Basic').build_transaction_category.category = (!!subtrx[:category] && Category.find(subtrx[:category])) || nil
			else s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Subtransfer').build_transaction_account(:direction => 'inflow').account = Account.find(subtrx[:account])
		end 
	end
	s.save
end

def create_loanrepayment_transaction(trx)
	# Loan Repayment Transaction
	s = LoanRepaymentTransaction.new(:amount => trx[:amount], :memo => trx[:memo])
	s.build_transaction_account(:direction => 'outflow').account = (!!trx[:account] && Account.find(trx[:account])) || nil
	s.build_header(:transaction_date => trx[:transaction_date]).payee = (!!trx[:payee] && Payee.find(trx[:payee])) || nil

	# Add splits
	@tmp_splits[trx[:id]].each do |trxid|
		subtrx = @tmp_transactions[trxid]
		case subtrx[:type]
			when 'subtransaction' then s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Basic').build_transaction_category.category = (!!subtrx[:category] && Category.find(subtrx[:category])) || nil
			else s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Subtransfer').build_transaction_account(:direction => 'outflow').account = (!!subtrx[:account] && Account.find(subtrx[:account])) || nil
		end 
	end
	s.save
end

def create_subtransaction_transaction(trx)
	#noop
end

def create_subtransfer_transaction(trx)
	#noop
end

def create_payslip_beforetax_transaction(trx)
	#noop
end

def create_payslip_tax_transaction(trx)
	#noop
end

load_accounts
load_payees
load_categories
load_transactions
