# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'factory_bot' unless ENV[:RACK_ENV.to_s].eql? 'production'

namespace :db do
	namespace :e2e do
		desc 'Load payees for e2e tests'
		task payees: :environment do
			# Mixin factory bot syntax
			include FactoryBot::Syntax::Methods

			# Connect to the test database
			ActiveRecord::Base.establish_connection :test

			# Truncate any existing data
			DatabaseCleaner.clean_with :truncation

			# Create 20 payees (1 favourite)
			create_list :payee, 19
			create :favourite_payee

			# Reset the database connection
			ActiveRecord::Base.establish_connection ENV['RAILS_ENV']
		end
	end
end
