# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Transactable
module Transactable
	extend ActiveSupport::Concern

	include Categorisable

	# Maximum number of transactions to return
	NUM_RESULTS = 150
	private_constant :NUM_RESULTS

	LEDGER_QUERY_OPTS = {
		prev: {
			operator: '<',
			order: 'DESC'
		},
		next: {
			operator: '>',
			order: 'ASC'
		}
	}.freeze

	private_constant :LEDGER_QUERY_OPTS

	def ledger(opts = {})
		# Check the options and set defaults where required
		opts = ledger_options opts

		# Query the database for transactions
		transactions = ledger_query opts

		# Have we reached the end of the transactions (in this direction)?
		at_end = transactions.size < NUM_RESULTS

		# Get the date of the last transaction in the results
		closing_date = transactions.last['transaction_date'] unless at_end

		# If going backwards, reverse the results to be in chronological order and remove any transactions
		# for the opening date so that the batch contains only full days
		transactions = drop_opening_date transactions, at_end, closing_date if opts[:direction].eql? :prev

		# Get the opening balance
		opening_balance = ledger_opening_balance opts, at_end, closing_date

		# If we're only interested in unreconciled transactions, sum & drop all reconciled ones
		opening_balance, transactions = exclude_reconciled opening_balance, transactions if opts[:unreconciled]

		# Remap to the desired output format
		transactions.map!(&method(:to_ledger_json))

		[opening_balance, transactions, at_end]
	end

	def closing_balance(opts = {})
		as_at =
			begin
				Date.parse(opts[:as_at]).to_s
			rescue TypeError, ArgumentError
				'2400-12-31'
			end

		if account_type.eql? 'investment'
			# Get the total quantity of security inflows
			security_quantities =
				transactions
				.for_closing_balance(opts)
				.select(
					[
						'transaction_headers.security_id',
						'transaction_accounts.direction',
						'SUM(transaction_headers.quantity) AS total_quantity'
					]
				)
				.where(transaction_type: %w[SecurityInvestment SecurityTransfer SecurityHolding])
				.where('transaction_headers.transaction_date <= ?', as_at)
				.where('transaction_headers.transaction_date IS NOT NULL')
				.group(
					'transaction_headers.security_id',
					'transaction_accounts.direction'
				)

			# Reduce to a unique set of securities with the current quantity held
			securities =
				security_quantities.each_with_object(Hash.new(0)) do |s, secs|
					secs[s.security_id] += s.total_quantity * (s.direction.eql?('inflow') ? 1 : -1)
				end

			# Calculate the current value of the securities held
			total_security_value = securities.map { |(security, qty)| Security.find(security).price(as_at) * qty }.reduce(:+) || 0

			# Add the balance from the associated cash account
			total_security_value += related_account.closing_balance opts unless related_account.nil?

			total_security_value
		else
			totals = []

			# Get the total Basic transactions
			totals +=
				transactions
				.for_basic_closing_balance(opts)
				.select(
					[
						'categories.direction',
						'SUM(transactions.amount) AS total_amount'
					]
				)
				.joins('JOIN categories ON transaction_categories.category_id = categories.id')
				.where(transaction_type: %w[Basic Sub])
				.where('transaction_headers.transaction_date <= ?', as_at)
				.where('transaction_headers.transaction_date IS NOT NULL')
				.group 'categories.direction'

			# Get the total Subtransfer transactions
			totals +=
				transactions
				.for_closing_balance(opts)
				.select(
					[
						'transaction_accounts.direction',
						'SUM(transactions.amount) AS total_amount'
					]
				)
				.joins(
					[
						'JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id',
						'JOIN transactions parent_transactions ON parent_transactions.id = transaction_splits.parent_id'
					]
				)
				.where(transaction_type: 'Subtransfer')
				.where('transaction_headers.transaction_date <= ?', as_at)
				.where('transaction_headers.transaction_date IS NOT NULL')
				.where('parent_transactions.transaction_type = \'Split\' or parent_transactions.transaction_type = \'LoanRepayment\' or parent_transactions.transaction_type = \'Payslip\'')
				.group 'transaction_accounts.direction'

			# Get the total other inflows
			total_inflows =
				transactions
				.for_closing_balance(opts)
				.where(transaction_type: %w[Split Payslip Transfer Dividend SecurityInvestment])
				.where('transaction_headers.transaction_date <= ?', as_at)
				.where('transaction_headers.transaction_date IS NOT NULL')
				.where(transaction_accounts: {direction: 'inflow'})
				.sum 'amount'

			# Get the total other outflows
			total_outflows =
				transactions
				.for_closing_balance(opts)
				.where(transaction_type: %w[Split LoanRepayment Transfer SecurityInvestment])
				.where('transaction_headers.transaction_date <= ?', as_at)
				.where('transaction_headers.transaction_date IS NOT NULL')
				.where(transaction_accounts: {direction: 'outflow'})
				.sum 'amount'

			totals.each do |t|
				total_outflows += t.total_amount if t.direction.eql? 'outflow'
				total_inflows += t.total_amount if t.direction.eql? 'inflow'
			end

			opening_balance + total_inflows - total_outflows
		end
	end

	private unless Rails.env.eql? 'test'

	def ledger_options(opts = {})
		# Default as_at if not specified or invalid
		opts[:as_at] =
			begin
				Date.parse(opts[:as_at]).to_s
			rescue TypeError, ArgumentError
				'2400-12-31'
			end

		# Default direction if not specified or invalid
		opts[:direction] = opts[:direction].present? && opts[:direction].to_sym || :prev
		opts[:direction] = :prev unless LEDGER_QUERY_OPTS.key? opts[:direction]

		# Default unreconciled if not specified or invalid
		opts[:unreconciled] = opts[:unreconciled].eql? 'true'

		opts
	end

	def ledger_query(opts)
		# Get the specified number of transactions up to the given date
		transactions
			.for_ledger(opts)
			.select(
				[
					'transactions.id',
					'transactions.transaction_type',
					'transaction_headers.transaction_date',
					'transaction_headers.payee_id',
					'accounts.id AS primary_account_id',
					'accounts.name AS primary_account_name',
					'accounts.account_type AS primary_account_type',
					'payees.name AS payee_name',
					'transaction_headers.security_id',
					'securities.name AS security_name',
					'categories.id AS category_id',
					'categories.name AS category_name',
					'parent_categories.id AS parent_category_id',
					'parent_categories.name AS parent_category_name',
					'transfer_accounts.id AS transfer_account_id',
					'transfer_accounts.name AS transfer_account_name',
					'transfer_transaction_accounts.status AS transfer_status',
					'transaction_splits.parent_id AS split_parent_id',
					'split_accounts.id AS split_account_id',
					'split_accounts.name AS split_account_name',
					'split_accounts.account_type AS split_account_type',
					'split_transaction_accounts.direction AS split_parent_direction',
					'split_transaction_accounts.status AS split_parent_status',
					'transactions.amount',
					'transaction_headers.quantity',
					'transaction_headers.price',
					'transaction_headers.commission',
					'transaction_accounts.direction',
					'transaction_accounts.status',
					'transactions.memo',
					'transaction_flags.memo AS flag'
				]
			)
			.joins(
				[
					'LEFT OUTER JOIN accounts ON accounts.id = transaction_accounts.account_id',
					'LEFT OUTER JOIN payees ON payees.id = transaction_headers.payee_id',
					'LEFT OUTER JOIN securities ON securities.id = transaction_headers.security_id',
					'LEFT OUTER JOIN categories ON categories.id = transaction_categories.category_id',
					'LEFT OUTER JOIN categories parent_categories ON parent_categories.id = categories.parent_id',
					'LEFT OUTER JOIN transaction_accounts transfer_transaction_accounts ON transfer_transaction_accounts.transaction_id = transactions.id AND transfer_transaction_accounts.account_id != transaction_accounts.account_id',
					'LEFT OUTER JOIN accounts transfer_accounts ON transfer_accounts.id = transfer_transaction_accounts.account_id',
					'LEFT OUTER JOIN transaction_accounts split_transaction_accounts ON split_transaction_accounts.transaction_id = transaction_splits.parent_id',
					'LEFT OUTER JOIN accounts split_accounts ON split_accounts.id = split_transaction_accounts.account_id',
					'LEFT OUTER JOIN transaction_flags ON transaction_flags.transaction_id = transactions.id'
				]
			)
			.where("transaction_headers.transaction_date #{LEDGER_QUERY_OPTS[opts[:direction]][:operator]} ?", opts[:as_at])
			.order(
				"transaction_headers.transaction_date #{LEDGER_QUERY_OPTS[opts[:direction]][:order]}",
				"transactions.id #{LEDGER_QUERY_OPTS[opts[:direction]][:order]}"
			)
			.limit(NUM_RESULTS)
			.to_a
	end

	def drop_opening_date(transactions, at_end, opening_date)
		# Reverse the transactions so they are in chronological order
		transactions.reverse!

		# If we're not at the end, drop any transactions for the opening date so that we're only dealing with full days
		at_end ? transactions : transactions.drop_while { |trx| trx['transaction_date'].eql? opening_date }
	end

	def ledger_opening_balance(opts, at_end, closing_date)
		# The opening balance is either:
		# a) the opening balance (when going backwards and reach the first transaction)
		# b) the closing balance as at the closing_date (when going backwards)
		# c) the closing balance as at the passed date (when going forwards)
		if opts[:direction].eql? :prev
			at_end ? opening_balance : closing_balance(opts.merge as_at: closing_date.to_s)
		else
			closing_balance opts
		end
	end

	def exclude_reconciled(opening_balance, transactions)
		opening_balance =
			transactions.select { |trx| trx['status'].eql?('Reconciled') && !trx['amount'].nil? }.reduce(opening_balance) do |total, trx|
				total + (trx['amount'] * (trx['direction'].eql?('inflow') ? 1 : -1))
			end

		[opening_balance, transactions.delete_if { |trx| trx['status'].eql? 'Reconciled' }]
	end

	def to_ledger_json(trx)
		{
			id: trx['id'],
			transaction_type: trx['transaction_type'],
			transaction_date: trx['transaction_date'],
			primary_account: {
				id: trx['primary_account_id'] || trx['split_account_id'],
				name: trx['primary_account_name'] || trx['split_account_name'],
				account_type: trx['primary_account_type'] || trx['split_account_type']
			},
			payee: {
				id: trx['payee_id'],
				name: trx['payee_name']
			},
			security: {
				id: trx['security_id'],
				name: trx['security_name']
			},
			category: (is_a?(Class) && self || self.class).transaction_category(trx, account_type),
			subcategory: (is_a?(Class) && self || self.class).basic_subcategory(trx),
			account: {
				id: (trx['transaction_type'].eql?('Subtransfer') && trx['split_account_id'] || trx['transfer_account_id']),
				name: (trx['transaction_type'].eql?('Subtransfer') && trx['split_account_name'] || trx['transfer_account_name'])
			},
			parent_id: trx['split_parent_id'],
			amount: trx['amount'],
			quantity: trx['quantity'],
			commission: trx['commission'],
			price: trx['price'],
			direction: trx['direction'] || trx['split_parent_direction'],
			status: trx['status'],
			related_status: (trx['transaction_type'].eql?('Subtransfer') && trx['split_parent_status'] || trx['transfer_status']),
			memo: trx['memo'],
			flag: trx['flag']
		}
	end
end
