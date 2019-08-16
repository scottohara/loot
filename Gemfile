# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

ruby '2.6.3'

source 'https://rubygems.org'

# Web application framework
gem 'rails', '5.2.3'

# Postgres
gem 'pg'

group :development, :production do
	# Use unicorn as the app server
	gem 'unicorn'
end

# 12 factor gem for Heroku
gem 'rails_12factor', group: :production

# For JSON serialisation
gem 'active_model_serializers', '>= 0.10.9'

group :development, :test do
	# Cleans database on each test run
	gem 'database_cleaner'

	# Test factories
	gem 'factory_bot_rails', '>= 5.0.2'

	# BDD testing framework
	gem 'rspec-rails', '>= 3.8.2'

	# Code coverage
	gem 'simplecov'

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing', '>= 1.0.4'

	# Code style checker
	gem 'rubocop', require: false

	# Shared Rubocop config
	gem 'rubocop-config-oharagroup', require: false
end

group :development do
	# File watcher
	gem 'listen'

	# Step/next commands for pry
	gem 'pry-nav'

	# Use pry instead of IRB
	gem 'pry-rails'
end
