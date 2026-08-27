# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :security_holding_transaction, aliases: [:security_add_transaction] do
		security_transaction
		schedulable

		# Adding shares moves them into the investment account; transaction date defaults to the header sequence if none specified
		transient do
			account { ::FactoryBot.build :investment_account }
			direction { 'inflow' }
			quantity { 10 }
			status { nil }
			transaction_date { nil }
		end

		after :build do |trx, evaluator|
			trx.header.transaction_date = evaluator.transaction_date unless evaluator.transaction_date.nil?
			trx.header.quantity = evaluator.quantity
			trx.transaction_account = ::FactoryBot.build :transaction_account, account: evaluator.account, direction: evaluator.direction, status: evaluator.status
		end

		# Removing shares moves them out of the investment account
		trait :outflow do
			direction { 'outflow' }
		end

		factory :security_remove_transaction, traits: [:outflow]
	end
end
