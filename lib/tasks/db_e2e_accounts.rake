# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'factory_bot' unless ENV[:RACK_ENV.to_s].eql? 'production'

namespace :db do
	namespace :e2e do
		desc 'Load accounts for e2e tests'
		task accounts: :environment do
			# Mixin factory bot syntax
			include FactoryBot::Syntax::Methods

			# Connect to the test database
			ActiveRecord::Base.establish_connection :test

			# Truncate any existing data
			DatabaseCleaner.clean_with :truncation

			# Create accounts of all types (1 favourite)
			create :bank_account, opening_balance: 500
			create :favourite_account
			create :cash_account, opening_balance: 2000
			create :credit_account, opening_balance: 0, status: 'closed'
			create :investment_account, opening_balance: 3000
			create :investment_account, opening_balance: 0
			create :loan_account, opening_balance: -1000

			# Reset the database connection
			ActiveRecord::Base.establish_connection ENV['RAILS_ENV']
		end
	end
end
