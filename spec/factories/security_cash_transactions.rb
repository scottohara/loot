# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	trait :security_cash_transaction do
		# Default attributes for a security transaction
		security_transaction
		amount

		# Default accounts if none specified; direction is the investment side, and the cash side always moves the opposite way
		transient do
			investment_account { ::FactoryBot.build :investment_account, related_account: cash_account }
			cash_account { ::FactoryBot.build :bank_account }
			direction { 'outflow' }
			status { nil }
		end

		after :build do |trx, evaluator|
			trx.transaction_accounts << ::FactoryBot.build(:transaction_account, account: evaluator.investment_account, direction: evaluator.direction, status: evaluator.status)
			trx.transaction_accounts << ::FactoryBot.build(:transaction_account, account: evaluator.cash_account, direction: (evaluator.direction.eql?('inflow') ? 'outflow' : 'inflow'))
		end
	end
end
