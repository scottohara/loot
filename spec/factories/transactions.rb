# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

FactoryGirl.define do
	trait :amount do
		amount 1
	end

	trait :memo do
		memo { "#{transaction_type} transaction" }
	end

	trait :flagged do
		after :build do |trx|
			trx.flag = FactoryGirl.build :transaction_flag, memo: 'Transaction flag'
		end
	end

	factory :transaction do
		transaction_type 'Basic'
		amount
		memo
	end
end
