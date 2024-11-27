# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require_relative 'db_e2e'

::DB::E2E.create_test_data(:securities) do
	# Create 20 securities (1 favourite)
	security1 = create :security
	security2 = create :favourite_security
	create_list :security, 18

	# Create 2 security transactions
	create :security_purchase_transaction, security: security1, quantity: 2
	create :security_sale_transaction, security: security2
end
