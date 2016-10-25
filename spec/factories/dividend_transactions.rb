# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true
FactoryGirl.define do
	factory :dividend_transaction do
		# Default attributes for security transaction
		security_transaction
		amount

		# Default accounts if none specified
		transient do
			investment_account { FactoryGirl.build :investment_account, related_account: cash_account }
			cash_account { FactoryGirl.build :bank_account }
			status nil
		end

		after :build do |trx, evaluator|
			trx.transaction_accounts << FactoryGirl.build(:transaction_account, account: evaluator.investment_account, direction: 'outflow', status: evaluator.status)
			trx.transaction_accounts << FactoryGirl.build(:transaction_account, account: evaluator.cash_account, direction: 'inflow', status: evaluator.status)
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
	end
end
