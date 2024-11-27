# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require_relative 'db_e2e'

::DB::E2E.create_test_data(:accounts) do
	# Create accounts of all types (1 favourite)
	create :bank_account, opening_balance: 500
	create :favourite_account
	create :cash_account, opening_balance: 2000
	create :credit_account, opening_balance: 0, status: 'closed'
	create :investment_account, opening_balance: 3000
	create :investment_account, opening_balance: 0
	create :loan_account, opening_balance: -1000
end
