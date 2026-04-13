# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::RSpec.configure do |config|
	# DatabaseCleaner configuration
	config.before :suite do
		::DatabaseCleaner.strategy = :transaction
		::DatabaseCleaner.clean_with :truncation
	end

	config.around do |example|
		::DatabaseCleaner.cleaning { example.run }
	end
end
