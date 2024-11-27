# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require_relative 'db_e2e'

::DB::E2E.create_test_data(:categories) do
	# Create 4 income categories and 4 expense categories (1 favourite), each with 2 subcategories
	create_list :inflow_category, 4, :with_children
	create_list :outflow_category, 3, :with_children
	create :favourite_category, :outflow
end
