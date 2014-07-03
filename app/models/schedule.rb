class Schedule < ActiveRecord::Base
	validates :next_due_date, :frequency, :presence => true
	validates :estimate, :auto_enter, :inclusion => {:in => [true,false]}
	has_one :transaction_header

	include Categorisable

	class << self
		def ledger
			schedules = Schedule
				.select(		"transactions.id",
										"transactions.transaction_type",
										"accounts.id AS account_id",
										"accounts.name AS account_name",
										"accounts.account_type AS account_type",
										"schedules.next_due_date",
										"schedules.frequency",
										"schedules.estimate",
										"schedules.auto_enter",
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
				.joins([		"JOIN transaction_headers ON transaction_headers.schedule_id = schedules.id",
										"JOIN transactions ON transactions.id = transaction_headers.transaction_id",
										"JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
										"LEFT OUTER JOIN accounts ON accounts.id = transaction_accounts.account_id",
										"LEFT OUTER JOIN payees ON payees.id = transaction_headers.payee_id",
										"LEFT OUTER JOIN securities ON securities.id = transaction_headers.security_id",
										"LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id",
										"LEFT OUTER JOIN categories ON categories.id = transaction_categories.category_id",
										"LEFT OUTER JOIN categories parent_categories ON parent_categories.id = categories.parent_id",
										"LEFT OUTER JOIN transaction_accounts transfer_transaction_accounts ON transfer_transaction_accounts.transaction_id = transactions.id AND transfer_transaction_accounts.account_id != transaction_accounts.account_id",
										"LEFT OUTER JOIN accounts transfer_accounts ON transfer_accounts.id = transfer_transaction_accounts.account_id",
										"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id",
										"LEFT OUTER JOIN transaction_accounts split_transaction_accounts ON split_transaction_accounts.transaction_id = transaction_splits.parent_id",
										"LEFT OUTER JOIN accounts split_accounts ON split_accounts.id = split_transaction_accounts.account_id"])
				.where(			"transactions.transaction_type != 'Subtransfer'")
				.order(			"schedules.next_due_date ASC",
										"transactions.id ASC")
				.to_a

			# For Transfer/SecurityTransfers, only keep the source account side; and for SecurityInvestment/Dividends only keep the investment account side
			schedules.reject! do |trx|
				(%w(Transfer SecurityTransfer).include?(trx['transaction_type']) && trx['direction'].eql?('inflow')) || (%w(SecurityInvestment Dividend).include?(trx['transaction_type']) && !trx['account_type'].eql?('investment'))
			end

			# Remap to the desired output format
			schedules.map do |trx|
				{
					:id => trx['id'],
					:transaction_type => trx['transaction_type'],
					:primary_account => {
						:id => trx['account_id'],
						:name => trx['account_name'],
						:account_type => trx['account_type']
					},
					:next_due_date => trx['next_due_date'],
					:frequency => trx['frequency'],
					:estimate => trx['estimate'],
					:auto_enter => trx['auto_enter'],
					:payee => {
						:id => trx['payee_id'],
						:name => trx['payee_name']
					},
					:security => {
						:id => trx['security_id'],
						:name => trx['security_name']
					},
					:category => self.transaction_category(trx, trx['account_type']),
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
		end

		def auto_enter_overdue
			overdue = self
				.where(:auto_enter => true)
				.where('next_due_date < ?', Date.today.to_s)

			overdue.each do |schedule|
				# Find the associated transaction header
				header = TransactionHeader.includes(:trx).find_by_schedule_id schedule.id

				# What type of transaction is it?
				transaction_class = Transaction.class_for header.trx.transaction_type

				# Find the transaction
				transaction = transaction_class.includes(:header => [:schedule]).find header.trx.id

				# Clear the schedule info and set the transaction date to the next due date
				transaction.header.transaction_date = transaction.header.schedule.next_due_date
				transaction.header.schedule = nil

				# Get the JSON representation of the scheduled transaction
				transaction_json = transaction.as_json :direction => 'outflow'

				# Find the appropriate account to use
				transaction_json[:account_id] = case transaction.transaction_type
					when 'Transfer', 'SecurityTransfer' then transaction.source_account.id
					when 'SecurityInvestment', 'Dividend' then transaction.investment_account.id
					else transaction.account.id
				end

				# For Splits, we need to get the subtransactions as well
				transaction_json['subtransactions'] = transaction.children if %w(Split Payslip LoanRepayment).include?(transaction.transaction_type)

				# Clear the id
				transaction_json[:id] = nil

				# The 'json' is actually a hash, with symbols for keys
				# The models are expecting string-based keys
				transaction_json = transaction_json.with_indifferent_access

				# Create a new instance of the transaction
				transaction_class.create_from_json transaction_json

				# Update the schedule's next due date
				schedule.next_due_date += case schedule.frequency
					when 'Fortnightly' then 2.weeks
					when 'Monthly' then 1.month
					when 'Quarterly' then 3.months
					when 'Yearly' then 1.year
				end

				# Save the schedule
				schedule.save!
			end
		end
	end

	def as_json(options={})
		super.merge({
			:next_due_date => self.next_due_date,
			:frequency => self.frequency,
			:estimate => self.estimate,
			:auto_enter => self.auto_enter
		})
	end
end
