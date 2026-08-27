# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :split_transaction, aliases: [:split_to_transaction] do
		payee_cash_transaction
		schedulable

		# Default account, subtransactions and subtransfers if none specified
		transient do
			account { ::FactoryBot.build :account }
			direction { 'outflow' }
			category { ::FactoryBot.build(:category, direction:) }
			subtransactions { 1 }
			subtransfers { 0 }
			subtransfer_account { ::FactoryBot.build :account }
			status { nil }
		end

		after :build do |trx, evaluator|
			trx.transaction_account = ::FactoryBot.build :transaction_account, account: evaluator.account, direction: evaluator.direction, status: evaluator.status

			children =
				build_list((evaluator.direction.eql?('outflow') ? :sub_expense_transaction : :sub_income_transaction), evaluator.subtransactions, parent: trx, category: evaluator.category) +
				build_list(:subtransfer_transaction, evaluator.subtransfers, parent: trx, payee: evaluator.payee, account: evaluator.subtransfer_account)

			children.each { it.transaction_split.trx = it }
			trx.amount = children.sum(&:amount)
		end

		trait :inflow do
			direction { 'inflow' }
		end

		factory :split_from_transaction, traits: [:inflow]
		factory :payslip_transaction, class: 'PayslipTransaction', traits: [:inflow]
		factory :loan_repayment_transaction, class: 'LoanRepaymentTransaction'
	end
end
