# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

FactoryBot.define do
	factory :security_holding_transaction, aliases: [:security_add_transaction] do
		# Default attributes for security transaction
		security_transaction

		# Default accounts if none specified
		transient do
			account { FactoryBot.build :investment_account }
			direction { 'Add' }
			quantity { 10 }
			status { nil }
			transaction_date { nil }
		end

		after :build do |trx, evaluator|
			trx.header.transaction_date = evaluator.transaction_date unless evaluator.transaction_date.nil?
			trx.header.quantity = evaluator.quantity
			trx.transaction_account = FactoryBot.build :transaction_account, account: evaluator.account, direction: (evaluator.direction.eql?('Add') ? 'inflow' : 'outflow'), status: evaluator.status
		end

		trait :outflow do
			direction { 'Remove' }
		end

		trait :scheduled do
			transient do
				next_due_date { Time.zone.tomorrow.advance months: -1 }
			end

			after :build do |trx, evaluator|
				trx.header.transaction_date = nil
				trx.header.schedule = build :schedule, next_due_date: evaluator.next_due_date
			end
		end

		factory :security_remove_transaction, traits: [:outflow]
	end
end
