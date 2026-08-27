# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	trait :amount do
		amount { 1 }
	end

	trait :memo do
		memo { "#{transaction_type} transaction" }
	end

	trait :flagged do
		after :build do |trx|
			trx.flag = ::FactoryBot.build :transaction_flag, flag_type: 'noreceipt', memo: 'Transaction flag'
		end
	end

	# Allows a transaction to be scheduled with the :scheduled trait
	# Must be applied after a transaction header is built
	trait :schedulable do
		transient do
			next_due_date { nil }
			frequency { nil }
			auto_enter { nil }
		end

		after :build do |trx, evaluator|
			unless evaluator.next_due_date.nil?
				# Unspecified attributes fall back to the schedule factory defaults
				schedule_attributes = {next_due_date: evaluator.next_due_date, frequency: evaluator.frequency, auto_enter: evaluator.auto_enter}.compact

				trx.header.transaction_date = nil
				trx.header.schedule = ::FactoryBot.build :schedule, **schedule_attributes
			end
		end
	end

	trait :scheduled do
		transient do
			next_due_date { ::Time.zone.tomorrow.advance weeks: -4 }
		end
	end

	factory :transaction do
		transaction_type { 'Basic' }
		amount
		memo
	end
end
