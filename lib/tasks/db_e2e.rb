# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rake'

module DB
	# e2e test data helper
	module E2E
		extend ::Rake::DSL

		class << self
			def create_test_data(name, &)
				return unless ::Rails.env.local?

				require 'factory_bot'

				# Mixin factory bot syntax
				extend ::FactoryBot::Syntax::Methods

				namespace :db do
					namespace :e2e do
						desc "Load data for #{name} e2e tests"
						task name, [:args] => :environment do |_, args|
							# Connect to the test database
							::ActiveRecord::Base.establish_connection :test

							# Truncate any existing data
							::ActiveRecord::Tasks::DatabaseTasks.truncate_all 'test'

							# Create new data
							instance_exec(*args[:args]&.split(','), &)
						end
					end
				end
			end
		end
	end
end
