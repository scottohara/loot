# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# :nocov:
require 'factory_bot' if ::Rails.env.local?
# :nocov:end
require 'rake'

module DB
	# e2e test data helper
	module E2E
		extend ::Rake::DSL

		class << self
			# Mixin factory bot syntax
			include ::FactoryBot::Syntax::Methods

			def create_test_data(name, &)
				namespace :db do
					namespace :e2e do
						desc "Load data for #{name} e2e tests"
						task name, [:args] => :environment do |_, args|
							# Connect to the test database
							::ActiveRecord::Base.establish_connection :test

							# Truncate any existing data
							::DatabaseCleaner.clean_with :truncation

							# Create new data
							instance_exec(*args[:args]&.split(','), &)
						end
					end
				end
			end
		end
	end
end
