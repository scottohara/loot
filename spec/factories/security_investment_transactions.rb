# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :security_investment_transaction, aliases: [:security_purchase_transaction] do
		# Default attributes for a security cash transaction
		security_cash_transaction
		amount { (price * quantity) + (commission * (direction.eql?('inflow') ? 1 : -1)) }

		# Buying moves shares into the investment account; transaction date defaults to the header sequence if none specified
		transient do
			direction { 'inflow' }
			price { 1 }
			quantity { 1 }
			commission { 1 }
			transaction_date { nil }
		end

		after :build do |trx, evaluator|
			trx.header.transaction_date = evaluator.transaction_date unless evaluator.transaction_date.nil?
			trx.header.price = evaluator.price
			trx.header.quantity = evaluator.quantity
			trx.header.commission = evaluator.commission
		end

		after :create do |trx|
			trx.header.security.update_price! trx.header.price, trx.header.transaction_date, trx.id unless trx.header.transaction_date.nil?
		end

		# Selling moves shares out of the investment account
		trait :outflow do
			direction { 'outflow' }
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

		factory :security_sale_transaction, traits: [:outflow]
	end
end
