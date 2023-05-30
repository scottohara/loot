# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :sub_transaction, aliases: [:sub_expense_transaction] do
		# Default attributes for cash transaction
		cash_transaction
		transaction_type { 'Sub' }

		# Default account, subtransactions and subtransfers if none specified
		transient do
			parent { ::FactoryBot.build(:split_transaction) }
			category { ::FactoryBot.build(:category) }
		end

		after :build do |trx, evaluator|
			trx.parent = evaluator.parent
			trx.category = evaluator.category
		end

		trait :inflow do
			category { ::FactoryBot.build(:inflow_category) }
		end

		factory :sub_income_transaction, traits: [:inflow]
	end
end
