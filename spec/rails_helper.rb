# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'simplecov'
::SimpleCov.start 'rails' do
	coverage_dir 'coverage/backend'
	enable_coverage :branch
	add_group 'Serializers', 'app/serializers'
	minimum_coverage line: 100, branch: 100
end

# This file is copied to spec/ when you run 'rails generate rspec:install'
require 'spec_helper'
::ENV['RAILS_ENV'] ||= 'test'
require ::File.expand_path('../config/environment', __dir__)
# Prevent database truncation if the environment is production
abort('The Rails environment is running in production mode!') if ::Rails.env.production?
require 'rspec/rails'
# Add additional requires below this line. Rails is not loaded until this point!

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
# Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

# Checks for pending migrations before tests are run.
# If you are not using ActiveRecord, you can remove this line.
::ActiveRecord::Migration.maintain_test_schema!

::RSpec.configure do |config|
	# Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
	config.fixture_path = ::Rails.root.join 'spec/fixtures'

	# If you're not using ActiveRecord, or you'd prefer not to run each of your
	# examples within a transaction, remove the following line or assign false
	# instead of true.
	config.use_transactional_fixtures = true

	# RSpec Rails can automatically mix in different behaviours to your tests
	# based on their file location, for example enabling you to call `get` and
	# `post` in specs under `spec/controllers`.
	#
	# You can disable this behaviour by removing the line below, and instead
	# explicitly tag your specs with their type, e.g.:
	#
	#     RSpec.describe UsersController, type: :controller do
	#       # ...
	#     end
	#
	# The different available types are documented in the features, such as in
	# https://relishapp.com/rspec/rspec-rails/docs
	config.infer_spec_type_from_file_location!

	# FactoryBot configuration
	config.include ::FactoryBot::Syntax::Methods

	# Lint all factories
	config.before :suite do
		::DatabaseCleaner.clean_with :truncation

		# Do *transaction_header factories first, cleaning the database between each to avoid duplicate primary key errors
		%i[payee_transaction_header security_transaction_header transaction_header].each do |header_factory|
			::FactoryBot.lint(::FactoryBot.factories.select { |factory| factory.name.eql? header_factory })
			::DatabaseCleaner.clean_with :truncation
		end

		# Do the rest (except TransactionAccount)
		factories_to_skip = %i[transaction_header payee_transaction_header security_transaction_header transaction_account]
		::FactoryBot.lint(::FactoryBot.factories.reject { |factory| factories_to_skip.include? factory.name })
	end

	# DatabaseCleaner configuration
	config.before :suite do
		::DatabaseCleaner.strategy = :transaction
		::DatabaseCleaner.clean_with :truncation
	end

	config.around do |example|
		::DatabaseCleaner.cleaning { example.run }
	end
end

# Shared context for JSON controllers
::RSpec.shared_context 'JSON controller', type: :controller do
	before :each, :request do
		expect(controller).to receive :authenticate_user
		request.env['HTTP_ACCEPT'] = 'application/json'
	end

	after do
		expect(response).to have_http_status (defined?(expected_status) && expected_status) || 200
	end

	after :each, :json do
		expect(response.media_type).to eq 'application/json'
		expect(response.body).to eq json
	end
end
