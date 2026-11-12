# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

source 'https://rubygems.org', cooldown: 7
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby file: '.tool-versions'

# Web application framework
gem 'rails', '8.1.4.1'

# Database
gem 'pg', '1.7.0'

# App server
gem 'puma', '8.0.2'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '1.26.1', require: false

# CSV parsing for the db/seeds.rb importer; not a default gem since Ruby 3.4
gem 'csv', '3.3.7', require: false

group :development, :test do
	# Test factories
	gem 'factory_bot_rails', '6.5.1'

	# BDD testing framework
	gem 'rspec-rails', '8.0.4'

	# Code coverage
	gem 'simplecov', '1.3.2', require: false

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing', '1.0.5'

	# Code style checker
	gem 'rubocop', '1.92.2', require: false

	# Rubocop Rails cops
	gem 'rubocop-rails', '2.38.0', require: false

	# Rubocop Performance cops
	gem 'rubocop-performance', '1.27.0', require: false

	# Rubocop RSpec cops
	gem 'rubocop-rspec', '3.10.2', require: false

	# Rubocop RSpec Rails cops
	gem 'rubocop-rspec_rails', '2.33.0', require: false

	# Rubocop FactoryBot cops
	gem 'rubocop-factory_bot', '2.28.0', require: false

	# Rubocop Rake cops
	gem 'rubocop-rake', '0.7.1', require: false

	# Shared Rubocop config
	gem 'rubocop-config-oharagroup', '2.8.0', require: false

	# Code indexing for Rubocop
	gem 'rubydex', '0.4.4', require: false

	# Debugging
	gem 'debug', '1.11.1', require: 'debug/prelude'

	# Static analysis for security vulnerabilities
	gem 'brakeman', '8.1.0', require: false
end
