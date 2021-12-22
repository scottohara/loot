# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.0.2'

# Web application framework
gem 'rails', '7.0.1'

# Postgres
gem 'pg', '1.2.3'

group :development, :production do
	# Use Puma as the app server
	gem 'puma', '5.5.2'
end

# For JSON serialisation
gem 'active_model_serializers', '0.10.13'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '1.10.1', require: false

group :development, :test do
	# Cleans database on each test run
	gem 'database_cleaner', '2.0.1'

	# Test factories
	gem 'factory_bot_rails', '6.2.0'

	# BDD testing framework
	gem 'rspec-rails', '5.0.2'

	# Code coverage
	gem 'simplecov', '0.21.2', require: false

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing', '1.0.5'

	# Code style checker
	gem 'rubocop', '1.22.3', require: false

	# Rubocop Rails cops
	gem 'rubocop-rails', '2.12.4'

	# Rubocop Performance cops
	gem 'rubocop-performance', '1.12.0'

	# Rubocop RSpec cops
	gem 'rubocop-rspec', '2.6.0'

	# Rubocop Rake cops
	gem 'rubocop-rake', '0.6.0'

	# Shared Rubocop config
	gem 'rubocop-config-oharagroup', '2.3.0', require: false

	# Debugging
	gem 'debug', '1.4.0'
end
