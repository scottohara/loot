# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::RSpec.configure do |config|
	# FactoryBot configuration
	config.include ::FactoryBot::Syntax::Methods

	# TransactionAccount can't be linted in isolation: transaction_accounts.transaction_id is NOT NULL
	# but belongs_to :trx is deliberately optional (its inverse has_one is on a Transaction subclass).
	config.before(:suite) { ::FactoryBot.lint ::FactoryBot.factories.reject { it.name.eql? :transaction_account }, traits: true }
end
