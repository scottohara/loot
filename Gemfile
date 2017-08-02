# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

ruby '2.4.1'

source 'https://rubygems.org'

gem 'rails', '5.1.2'

# Postgres
gem 'pg'

group :development, :production do
	# Use unicorn as the app server
	gem 'unicorn'
end

# 12 factor gem for Heroku
gem 'rails_12factor', group: :production

# For JSON serialisation
gem 'active_model_serializers'

group :development, :test do
	gem 'database_cleaner'
	gem 'factory_girl_rails'
	gem 'rspec-rails'
	gem 'simplecov'

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing'
end

group :development do
	gem 'listen'

	# Use pry instead of IRB
	gem 'pry-nav'
	gem 'pry-rails'

	gem 'rubocop', require: false
end

# Code Climate test coverage
gem 'codeclimate-test-reporter', group: :test, require: nil
