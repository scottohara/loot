ruby "2.1.0"

source 'https://rubygems.org'

gem 'rails', '4.1.6'

# Postgres
gem 'pg'

# Use unicorn as the app server
gem 'unicorn'

# 12 factor gem for Heroku
gem 'rails_12factor', :group => :production

# For JSON serialisation
gem 'active_model_serializers'

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
