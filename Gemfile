# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby file: '.tool-versions'

# Web application framework
gem 'rails', '8.1.2'

# Database
gem 'pg', '1.6.3'

# App server
gem 'puma', '7.2.0'

# For JSON serialisation
gem 'active_model_serializers', '0.10.16'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '1.22.0', require: false

group :development, :test do
	# Cleans database on each test run
	gem 'database_cleaner', '2.1.0'

	# Test factories
	gem 'factory_bot_rails', '6.5.1'

	# BDD testing framework
	gem 'rspec-rails', '8.0.2'

	# Code coverage
	gem 'simplecov', '0.22.0', require: false

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing', '1.0.5'

	# Code style checker
	gem 'rubocop', '1.84.1', require: false

	# Rubocop Rails cops
	gem 'rubocop-rails', '2.34.3', require: false

	# Rubocop Performance cops
	gem 'rubocop-performance', '1.26.1', require: false

	# Rubocop RSpec cops
	gem 'rubocop-rspec', '3.9.0', require: false

	# Rubocop RSpec Rails cops
	gem 'rubocop-rspec_rails', '2.32.0', require: false

	# Rubocop FactoryBot cops
	gem 'rubocop-factory_bot', '2.28.0', require: false

	# Rubocop Rake cops
	gem 'rubocop-rake', '0.7.1', require: false

	# Shared Rubocop config
	gem 'rubocop-config-oharagroup', '2.6.0', require: false

	# Debugging
	gem 'debug', '1.11.1', require: 'debug/prelude'

	# Static analysis for security vulnerabilities
	gem 'brakeman', '8.0.2', require: false
end
