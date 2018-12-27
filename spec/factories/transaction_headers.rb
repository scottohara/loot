# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

FactoryBot.define do
	trait :transaction_date do
		sequence(:transaction_date) { |n| (Date.parse('2013-12-31') + n).to_s }
	end

	trait :scheduled do
		schedule
		transaction_date { nil }
	end

	factory :transaction_header do
		transaction_date
	end
end
