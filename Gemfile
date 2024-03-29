# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby file: '.tool-versions'

# Web application framework
gem 'rails', '7.1.3'

# Postgres
gem 'pg', '1.5.5'

group :development, :production do
	# Use Puma as the app server
	gem 'puma', '6.4.2'
end

# For JSON serialisation
gem 'active_model_serializers', '0.10.14'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '1.18.3', require: false

group :development, :test do
	# Cleans database on each test run
	gem 'database_cleaner', '2.0.2'

	# Test factories
	gem 'factory_bot_rails', '6.4.3'

	# BDD testing framework
	gem 'rspec-rails', '6.1.1'

	# Code coverage
	gem 'simplecov', '0.22.0', require: false

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing', '1.0.5'

	# Code style checker
	gem 'rubocop', '1.60.2', require: false

	# Rubocop Rails cops
	gem 'rubocop-rails', '2.23.1', require: false

	# Rubocop Performance cops
	gem 'rubocop-performance', '1.20.2', require: false

	# Rubocop RSpec cops
	gem 'rubocop-rspec', '2.26.1', require: false

	# Rubocop Rake cops
	gem 'rubocop-rake', '0.6.0', require: false

	# Shared Rubocop config
	gem 'rubocop-config-oharagroup', '2.4.0', require: false

	# Debugging
	gem 'debug', '1.9.1'
end
