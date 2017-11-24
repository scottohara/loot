# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

FactoryBot.define do
	trait :payee_cash_transaction do
		# Default attributes for a cash transaction
		cash_transaction

		# Default payee if none specified
		transient do
			payee { FactoryBot.build :payee }
		end

		after :build do |trx, evaluator|
			trx.header = FactoryBot.build :payee_transaction_header, payee: evaluator.payee
		end
	end
end
