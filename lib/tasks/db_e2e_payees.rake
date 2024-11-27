# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require_relative 'db_e2e'

::DB::E2E.create_test_data(:payees) do
	# Create 20 payees (1 favourite)
	create_list :payee, 19
	create :favourite_payee
end
