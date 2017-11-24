# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

FactoryBot.define do
	factory :payee_transaction_header do
		transaction_date
		payee
	end
end
