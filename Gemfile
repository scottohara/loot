# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.1.2'

# Web application framework
gem 'rails', '7.0.3'

# Postgres
gem 'pg', '1.4.1'

group :development, :production do
	# Use Puma as the app server
	gem 'puma', '5.6.4'
end

# For JSON serialisation
gem 'active_model_serializers', '0.10.13'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '1.12.0', require: false

group :development, :test do
	# Cleans database on each test run
	gem 'database_cleaner', '2.0.1'

	# Test factories
	gem 'factory_bot_rails', '6.2.0'

	# BDD testing framework
	gem 'rspec-rails', '5.1.2'

	# Code coverage
	gem 'simplecov', '0.21.2', require: false

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing', '1.0.5'

	# Code style checker
	gem 'rubocop', '1.31.1', require: false

	# Rubocop Rails cops
	gem 'rubocop-rails', '2.15.1', require: false

	# Rubocop Performance cops
	gem 'rubocop-performance', '1.14.2', require: false

	# Rubocop RSpec cops
	gem 'rubocop-rspec', '2.12.0', require: false

	# Rubocop Rake cops
	gem 'rubocop-rake', '0.6.0', require: false

	# Shared Rubocop config
	gem 'rubocop-config-oharagroup', '2.3.0', require: false

	# Debugging
	gem 'debug', '1.5.0'
end
