# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :payee do
		sequence(:name) { |n| "Payee #{n}" }

		transient do
			transactions { 0 }
			scheduled { 0 }
		end

		trait :with_all_transaction_types do
			after :build do |payee, evaluator|
				create(:basic_expense_transaction, :flagged, payee:, status: 'Cleared') # flagged and cleared
				create(:basic_income_transaction, payee:)
				create(:transfer_transaction, payee:)
				create(:split_to_transaction, payee:, subtransactions: 1, subtransfers: 1)
				create(:split_from_transaction, payee:, subtransactions: 1, subtransfers: 1)
				create(:payslip_transaction, payee:, subtransactions: 1, subtransfers: 1)
				create(:loan_repayment_transaction, payee:, subtransactions: 1, subtransfers: 1)

				# Create any scheduled transactions
				create_list(:basic_transaction, evaluator.scheduled, :scheduled, payee:)
			end
		end

		after :build do |payee, evaluator|
			create_list(:basic_transaction, evaluator.transactions, payee:)
		end

		trait :favourite do
			favourite { true }
		end

		factory :favourite_payee, traits: [:favourite]
	end
end
