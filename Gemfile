ruby "2.2.0"

source 'https://rubygems.org'

gem 'rails', '4.2.0'

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

# For controller respond_to
gem 'responders'

group :development, :test do
	gem 'rspec-rails'
	gem 'factory_girl_rails'
	gem 'database_cleaner'
	gem 'simplecov'
end

group :development do
	# Use pry instead of IRB
	gem 'pry-rails'
	gem 'pry-nav'

	# For deployment to Heroku
	gem 'heroku-api'
	gem 'git'
end

# Code Climate test coverage
gem 'codeclimate-test-reporter', group: :test, require: nil
