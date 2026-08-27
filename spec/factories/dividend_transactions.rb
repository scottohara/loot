# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :dividend_transaction do
		security_cash_transaction
		schedulable
	end
end
