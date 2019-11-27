# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'factory_bot' unless ENV[:RACK_ENV.to_s].eql? 'production'

namespace :db do
	namespace :e2e do
		desc 'Load transactions for e2e tests'
		task transactions: :environment do
			# Mixin factory bot syntax
			include FactoryBot::Syntax::Methods

			# Connect to the test database
			ActiveRecord::Base.establish_connection :test

			# Truncate any existing data
			DatabaseCleaner.clean_with :truncation

			# Create associated entities
			bank_account = create :bank_account
			another_bank_account = create :bank_account
			investment_account = create :investment_account
			payee = create :payee
			expense_subcategory = create :outflow_subcategory
			income_subcategory = create :inflow_subcategory
			security = create :security

			# Create transactions of all types
			create :basic_transaction, account: bank_account, payee: payee, category: expense_subcategory
			create :basic_transaction, account: bank_account, payee: payee, category: income_subcategory
			create :transfer_transaction, source_account: bank_account, payee: payee, destination_account: another_bank_account
			create :split_transaction, account: bank_account, payee: payee, category: expense_subcategory, subtransactions: 2
			create :loan_repayment_transaction, account: bank_account, payee: payee, category: expense_subcategory, subtransactions: 2
			create :payslip_transaction, account: bank_account, payee: payee, category: income_subcategory, subtransactions: 2
			create :security_purchase_transaction, security: security, investment_account: investment_account, cash_account: investment_account.related_account
			create :security_sale_transaction, security: security, investment_account: investment_account, cash_account: investment_account.related_account
			create :security_add_transaction, security: security, account: investment_account
			create :security_remove_transaction, security: security, account: investment_account
			create :security_transfer_transaction, security: security, source_account: investment_account
			create :dividend_transaction, security: security, investment_account: investment_account, cash_account: another_bank_account

			# Reset the database connection
			ActiveRecord::Base.establish_connection ENV['RAILS_ENV']
		end
	end
end
