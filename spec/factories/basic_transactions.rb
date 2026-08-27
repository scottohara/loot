# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :basic_transaction, aliases: [:basic_expense_transaction] do
		payee_cash_transaction
		schedulable

		# Default account and category if none specified
		transient do
			account { ::FactoryBot.build :account }
			category { ::FactoryBot.build :category }
			status { nil }
		end

		after :build do |trx, evaluator|
			trx.transaction_account = ::FactoryBot.build :transaction_account, account: evaluator.account, direction: evaluator.category.direction, status: evaluator.status
			trx.category = evaluator.category
		end

		trait :inflow do
			category { ::FactoryBot.build :inflow_category }
		end

		factory :basic_income_transaction, traits: [:inflow]
	end
end
