# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :security_investment_transaction, aliases: [:security_purchase_transaction] do
		# Default attributes for security transaction
		security_transaction
		amount { (price * quantity) + (commission * (direction.eql?('Buy') ? 1 : -1)) }

		# Default accounts if none specified
		transient do
			investment_account { ::FactoryBot.build :investment_account, related_account: cash_account }
			cash_account { ::FactoryBot.build :bank_account }
			direction { 'Buy' }
			price { 1 }
			quantity { 1 }
			commission { 1 }
			status { nil }
		end

		after :build do |trx, evaluator|
			trx.header.price = evaluator.price
			trx.header.quantity = evaluator.quantity
			trx.header.commission = evaluator.commission
			trx.transaction_accounts << ::FactoryBot.build(:transaction_account, account: evaluator.investment_account, direction: (evaluator.direction.eql?('Buy') ? 'inflow' : 'outflow'), status: evaluator.status)
			trx.transaction_accounts << ::FactoryBot.build(:transaction_account, account: evaluator.cash_account, direction: (evaluator.direction.eql?('Buy') ? 'outflow' : 'inflow'))
		end

		after :create do |trx|
			trx.header.security.update_price! trx.header.price, trx.header.transaction_date, trx.id unless trx.header.transaction_date.nil?
		end

		trait :inflow do
			direction { 'Sell' }
		end

		trait :scheduled do
			transient do
				next_due_date { ::Time.zone.tomorrow.advance weeks: -4 }
			end

			after :build do |trx, evaluator|
				trx.header.transaction_date = nil
				trx.header.schedule = build :schedule, next_due_date: evaluator.next_due_date
			end
		end

		factory :security_sale_transaction, traits: [:inflow]
	end
end
