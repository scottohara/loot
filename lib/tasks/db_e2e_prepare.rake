unless ENV[:RACK_ENV.to_s].eql?("production")
	require 'factory_girl'
end

namespace :db do
	namespace :e2e do
		desc "Load fixtures for e2e tests"
		task :prepare => :environment do
			# Mixin factory girl syntax
			include FactoryGirl::Syntax::Methods

			# Connect to the test database
			ActiveRecord::Base.establish_connection(:test)

			# Truncate any existing data
			DatabaseCleaner.clean_with :truncation

			# Accounts
			bank_account_1 = create :bank_account
			bank_account_2 = create :bank_account
			create :cash_account, opening_balance: 2000
			create :credit_account, opening_balance: 0, status: "closed"
			investment_account_1 = create :investment_account, opening_balance: 3000
			investment_account_2 = create :investment_account, opening_balance: 0
			create :loan_account, opening_balance: -1000

			# Categories
			income_parent = create :inflow_category
			create :inflow_category, parent: income_parent
			income_child_2 = create :inflow_category, parent: income_parent
			create_list :inflow_category, 3, children: 2
			expense_parent = create :outflow_category
			create :outflow_category, parent: expense_parent
			expense_child_2 = create :outflow_category, parent: expense_parent
			create_list :outflow_category, 2, children: 2

			# Payees
			payee = create :payee
			create_list :payee, 19

			# Securities
			security_1 = create :security
			security_2 = create :security
			create_list :security, 18

			# Schedules
			create :basic_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), account: bank_account_1, payee: payee, category: expense_child_2
			create :basic_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), account: bank_account_1, payee: payee, category: income_child_2
			create :transfer_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), source_account: bank_account_1, destination_account: bank_account_2, payee: payee
			create :split_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), account: bank_account_1, payee: payee, category: expense_child_2, subtransactions: 2
			create :loan_repayment_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), account: bank_account_1, payee: payee, category: expense_child_2, subtransactions: 2
			create :payslip_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), account: bank_account_1, payee: payee, category: income_child_2, subtransactions: 2
			create :security_purchase_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), security: security_1, investment_account: investment_account_1, cash_account: investment_account_1.related_account
			create :security_sale_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), security: security_1, investment_account: investment_account_1, cash_account: investment_account_1.related_account
			create :security_add_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), security: security_1, account: investment_account_1
			create :security_remove_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), security: security_1, account: investment_account_1
			create :security_transfer_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), security: security_1, source_account: investment_account_1, destination_account: investment_account_2
			create :dividend_transaction, :scheduled, next_due_date: Date.today.advance({days: 1}), security: security_1, investment_account: investment_account_1, cash_account: bank_account_1

			# Transactions
			create :basic_transaction, account: bank_account_1, payee: payee, category: expense_child_2
			create :basic_transaction, account: bank_account_1, payee: payee, category: income_child_2
			create :transfer_transaction, source_account: bank_account_1, destination_account: bank_account_2, payee: payee
			create :split_transaction, account: bank_account_1, payee: payee, category: expense_child_2, subtransactions: 2
			create :loan_repayment_transaction, account: bank_account_1, payee: payee, category: expense_child_2, subtransactions: 2
			create :payslip_transaction, account: bank_account_1, payee: payee, category: income_child_2, subtransactions: 2
			create :security_purchase_transaction, security: security_1, investment_account: investment_account_1, cash_account: investment_account_1.related_account
			create :security_sale_transaction, security: security_2, quantity: 2, investment_account: investment_account_1, cash_account: investment_account_1.related_account
			create :security_add_transaction, security: security_1, account: investment_account_1
			create :security_remove_transaction, security: security_1, account: investment_account_1
			create :security_transfer_transaction, security: security_1, source_account: investment_account_1, destination_account: investment_account_2
			create :dividend_transaction, security: security_1, investment_account: investment_account_1, cash_account: bank_account_1

			# Reset the database connection
			ActiveRecord::Base.establish_connection(ENV['RAILS_ENV'])
		end
	end
end
