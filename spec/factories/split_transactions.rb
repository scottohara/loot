# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :split_transaction, aliases: [:split_to_transaction] do
		# Default attributes for payee cash transaction
		payee_cash_transaction

		# Default account, subtransactions and subtransfers if none specified
		transient do
			account { ::FactoryBot.build :account }
			direction { 'outflow' }
			category { ::FactoryBot.build(:category, direction:) }
			subtransactions { 1 }
			subtransfers { 0 }
			subtransfer_account { ::FactoryBot.build :account }
			status { nil }

			# Next due date should only be non-nil for the :scheduled trait
			next_due_date { nil }
		end

		after :build do |trx, evaluator|
			# If a next due date is specified, replace transaction date with a schedule
			unless evaluator.next_due_date.nil?
				trx.header.transaction_date = nil
				trx.header.schedule = ::FactoryBot.build :schedule, next_due_date: evaluator.next_due_date
			end

			trx.transaction_account = ::FactoryBot.build :transaction_account, account: evaluator.account, direction: evaluator.direction, status: evaluator.status
			create_list (evaluator.direction.eql?('outflow') ? :sub_expense_transaction : :sub_income_transaction), evaluator.subtransactions, parent: trx, category: evaluator.category
			create_list :subtransfer_transaction, evaluator.subtransfers, parent: trx, payee: evaluator.payee, account: evaluator.subtransfer_account
			trx.amount = trx.subtransactions.pluck(:amount).sum + trx.subtransfers.pluck(:amount).sum
		end

		trait :inflow do
			direction { 'inflow' }
		end

		trait :scheduled do
			transient do
				next_due_date { ::Time.zone.tomorrow.advance weeks: -4 }
			end
		end

		factory :split_from_transaction, traits: [:inflow]
		factory :payslip_transaction, class: 'PayslipTransaction', traits: [:inflow]
		factory :loan_repayment_transaction, class: 'LoanRepaymentTransaction'
	end
end
