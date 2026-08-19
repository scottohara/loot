# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	trait :payee_cash_transaction do
		# Default attributes for a cash transaction
		cash_transaction

		# Default payee if none specified; transaction date defaults to the header sequence if none specified
		transient do
			payee { ::FactoryBot.build :payee }
			transaction_date { nil }
		end

		after :build do |trx, evaluator|
			trx.header = ::FactoryBot.build :payee_transaction_header, payee: evaluator.payee
			trx.header.transaction_date = evaluator.transaction_date unless evaluator.transaction_date.nil?
		end
	end
end
