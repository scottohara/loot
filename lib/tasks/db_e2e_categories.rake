# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'factory_bot' unless ENV[:RACK_ENV.to_s].eql? 'production'

namespace :db do
	namespace :e2e do
		desc 'Load categories for e2e tests'
		task categories: :environment do
			# Mixin factory bot syntax
			include FactoryBot::Syntax::Methods

			# Connect to the test database
			ActiveRecord::Base.establish_connection :test

			# Truncate any existing data
			DatabaseCleaner.clean_with :truncation

			# Create 4 income categories and 4 expense categories (1 favourite), each with 2 subcategories
			create_list :inflow_category, 4, :with_children
			create_list :outflow_category, 3, :with_children
			create :favourite_category, :outflow

			# Reset the database connection
			ActiveRecord::Base.establish_connection ENV['RAILS_ENV']
		end
	end
end
