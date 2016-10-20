ruby "2.3.1"

source 'https://rubygems.org'

gem 'rails', '5.0.0.1'

# Postgres
gem 'pg'

group :development, :production do
	# Use unicorn as the app server
	gem 'unicorn'
end

# 12 factor gem for Heroku
gem 'rails_12factor', group: :production

# For JSON serialisation
gem 'active_model_serializers', '0.9.5'

group :development, :test do
	gem 'rspec-rails'
	gem 'factory_girl_rails'
	gem 'database_cleaner'
	gem 'simplecov'

	# Required by RSpec in Rails >= 5 for 'assigns'
	gem 'rails-controller-testing'
end

group :development do
	gem 'listen'

	# Use pry instead of IRB
	gem 'pry-rails'
	gem 'pry-nav'

	# For deployment to Heroku
	gem 'heroku-api'
	gem 'git'

	gem 'rubocop', require: false
end

# Code Climate test coverage
gem 'codeclimate-test-reporter', group: :test, require: nil
