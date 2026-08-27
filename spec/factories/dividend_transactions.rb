# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :dividend_transaction do
		# Default attributes for a security cash transaction
		security_cash_transaction

		trait :scheduled do
			transient do
				next_due_date { ::Time.zone.tomorrow.advance weeks: -4 }
			end

			after :build do |trx, evaluator|
				trx.header.transaction_date = nil
				trx.header.schedule = build :schedule, next_due_date: evaluator.next_due_date
			end
		end
	end
end
