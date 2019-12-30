# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

FactoryBot.define do
	factory :basic_transaction, aliases: [:basic_expense_transaction] do
		# Default attributes for payee cash transaction
		payee_cash_transaction

		# Default account and category if none specified
		transient do
			account { FactoryBot.build :account }
			category { FactoryBot.build :category }
			status { nil }
		end

		after :build do |trx, evaluator|
			trx.transaction_account = FactoryBot.build :transaction_account, account: evaluator.account, direction: evaluator.category.direction, status: evaluator.status
			trx.category = evaluator.category
		end

		trait :inflow do
			category { FactoryBot.build :inflow_category }
		end

		trait :scheduled do
			transient do
				next_due_date { Time.zone.tomorrow.advance weeks: -4 }
				frequency { 'Monthly' }
				auto_enter { true }
			end

			after :build do |trx, evaluator|
				trx.header.transaction_date = nil
				trx.header.schedule = build :schedule, next_due_date: evaluator.next_due_date, frequency: evaluator.frequency, auto_enter: evaluator.auto_enter
			end
		end

		factory :basic_income_transaction, traits: [:inflow]
	end
end
