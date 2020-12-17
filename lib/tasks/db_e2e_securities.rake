# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'factory_bot' unless ::ENV[:RACK_ENV.to_s].eql? 'production'

namespace :db do
	namespace :e2e do
		desc 'Load securities for e2e tests'
		task securities: :environment do
			# Mixin factory bot syntax
			include ::FactoryBot::Syntax::Methods

			# Connect to the test database
			::ActiveRecord::Base.establish_connection :test

			# Truncate any existing data
			::DatabaseCleaner.clean_with :truncation

			# Create 20 securities (1 favourite)
			security1 = create :security
			security2 = create :favourite_security
			create_list :security, 18

			# Create 2 security transactions
			create :security_purchase_transaction, security: security1, quantity: 2
			create :security_sale_transaction, security: security2

			# Reset the database connection
			::ActiveRecord::Base.establish_connection ::ENV['RAILS_ENV']
		end
	end
end
