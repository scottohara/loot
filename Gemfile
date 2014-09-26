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

group :test do
	gem 'simplecov', '~> 0.8.2'
	gem 'minitest-spec-rails'
	gem 'database_cleaner'
end

gem 'factory_girl_rails', :group => [:development, :test]

# Use pry instead of IRB
group :development do
	gem 'pry-rails'
	gem 'pry-nav'
end
