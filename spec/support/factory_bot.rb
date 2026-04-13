# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::RSpec.configure do |config|
	# FactoryBot configuration
	config.include ::FactoryBot::Syntax::Methods

	# Lint all factories
	config.before :suite do
		::ActiveRecord::Base.transaction do
			# Do *transaction_header factories first, cleaning the database between each to avoid duplicate primary key errors
			%i[payee_transaction_header security_transaction_header transaction_header].each do |header_factory|
				::FactoryBot.lint(::FactoryBot.factories.select { |factory| factory.name.eql? header_factory }, traits: true)
			end
			raise ::ActiveRecord::Rollback
		end

		::ActiveRecord::Base.transaction do
			# Do the rest (except TransactionAccount)
			factories_to_skip = %i[transaction_header payee_transaction_header security_transaction_header transaction_account]
			::FactoryBot.lint(::FactoryBot.factories.reject { |factory| factories_to_skip.include? factory.name }, traits: true)
			raise ::ActiveRecord::Rollback
		end
	end
end
