# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

ruby '2.5.0'

source 'https://rubygems.org'

gem 'rails', '5.1.5'

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
	gem 'factory_bot_rails'
	gem 'rspec-rails'
	gem 'simplecov'

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing'

	gem 'rubocop', require: false
	gem 'rubocop-config-oharagroup', require: false
end

group :development do
	gem 'listen'

	# Use pry instead of IRB
	gem 'pry-nav'
	gem 'pry-rails'
end
