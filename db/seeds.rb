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

	CSV.foreach File.join(Dir.home, 'Documents', 'csv', 'TRN_SPLIT-rows.csv'), :headers => true do |row|
		@tmp_splits[row['htrnParent']] = [] unless @tmp_splits.has_key? row['htrnParent']
		@tmp_splits[row['htrnParent']] << row['htrn']
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
		@tmp_transactions[row['htrn']] = { :id => row['htrn'], :account => @tmp_accounts[row['hacct']], :transaction_date => row['dt'], :amount => row['amt'].to_f.abs, :memo => row['mMemo'], :payee => @tmp_payees[row['lHpay']], :category => ((!row['hcat'].nil?) && @tmp_categories[row['hcat']][:id]) }

		@tmp_transactions[row['htrn']][:type] = case
			when row['ps'].eql?('0') && !@tmp_splits.has_key?(row['htrn']) && !@tmp_transfers.has_key?(row['htrn']) && !@tmp_transfers.has_value?(row['htrn']) then 'basic'
			when row['ps'].eql?('0') && @tmp_splits.has_key?(row['htrn']) then 'split'
			when row['ps'].eql?('0') && @tmp_transfers.has_key?(row['htrn']) then 'transfer'
			when row['ps'].eql?('1') then 'payslip'
			when row['ps'].eql?('2') then 'subtransaction'
			when row['ps'].eql?('3') then 'payslip_beforetax'
			when row['ps'].eql?('4') then 'payslip_tax'
			when row['ps'].eql?('5') then 'loanrepayment'
		end
		progress "Prepared", $., "transaction" if $. % 10 == 0
	end
	progress "Prepared", $., "transaction"
	puts

	@tmp_transactions.sort_by {|k,v| Date.parse v[:transaction_date]}.each_with_index do |(id, trx), index|
		begin
			self.send "create_#{trx[:type]}_transaction".to_sym, trx unless trx[:type].nil?
			progress "Loaded", index, "transaction"
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

def create_split_transaction(trx)
	# Split Transaction
	s = SplitTransaction.new(:amount => trx[:amount], :memo => trx[:memo])
	s.build_transaction_account(:direction => 'outflow').account = (!!trx[:account] && Account.find(trx[:account])) || nil
	s.build_header(:transaction_date => trx[:transaction_date]).payee = (!!trx[:payee] && Payee.find(trx[:payee])) || nil

	# Add splits
	@tmp_splits[trx[:id]].each do |trxid|
		subtrx = @tmp_transactions[trxid]
		case subtrx[:type]
			when 'subtransaction' then s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Basic').build_transaction_category.category = (!!subtrx[:category] && Category.find(subtrx[:category])) || nil
			else s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Subtransfer').build_transaction_account(:direction => 'outflow').account = Account.find(subtrx[:account])
		end 
	end
	s.save
end

def create_transfer_transaction(trx)
	other_side = @tmp_transactions[@tmp_transfers[trx[:id]]]
	s = TransferTransaction.new(:amount => trx[:amount], :memo => trx[:memo])
	s.build_source_transaction_account(:direction => 'outflow').account = (!!trx[:account] && Account.find(trx[:account])) || nil
	s.build_destination_transaction_account(:direction => 'inflow').account = (!!other_side[:account] && Account.find(other_side[:account])) || nil
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
			when 'subtransaction' then s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Basic').build_transaction_category.category = (!!subtrx[:category] && Category.find(subtrx[:category])) || nil
			else s.transaction_splits.build.build_transaction(:amount => subtrx[:amount], :memo => subtrx[:memo], :transaction_type => 'Subtransfer').build_transaction_account(:direction => 'inflow').account = Account.find(subtrx[:account])
		end 
	end
	s.save
end

def create_loanrepayment_transaction(trx)
end

def create_subtransaction_transaction(trx)
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
