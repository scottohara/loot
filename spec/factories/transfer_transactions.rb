# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :transfer_transaction do
		payee_cash_transaction
		schedulable

		# Default accounts if none specified
		transient do
			source_account { ::FactoryBot.build :account }
			destination_account { ::FactoryBot.build :account }
			status { nil }
		end

		after :build do |trx, evaluator|
			trx.source_transaction_account = ::FactoryBot.build :transaction_account, account: evaluator.source_account, direction: 'outflow', status: evaluator.status
			trx.destination_transaction_account = ::FactoryBot.build :transaction_account, account: evaluator.destination_account, direction: 'inflow'
		end
	end
end
