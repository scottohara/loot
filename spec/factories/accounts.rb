# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :account, aliases: [:bank_account] do
		account_type { 'bank' }
		sequence(:name) { "#{account_type} account #{_1}" }
		opening_balance { 1000 }
		status { 'open' }

		transient do
			transactions { 0 }
			reconciled { 0 }
			scheduled { 0 }
		end

		trait :with_all_transaction_types do
			after :build do |account, evaluator|
				if account.account_type.eql? 'investment'
					create(:security_purchase_transaction, :flagged, investment_account: account, cash_account: account.related_account, status: 'Cleared') # flagged and cleared
					create(:security_sale_transaction, investment_account: account, cash_account: account.related_account)
					create(:security_transfer_transaction, source_account: account)
					create(:security_transfer_transaction, destination_account: account)
					create(:security_add_transaction, account:)
					create(:security_remove_transaction, account:)
					create(:dividend_transaction, investment_account: account, cash_account: account.related_account)

					# Create any scheduled transactions
					create_list(:security_holding_transaction, evaluator.scheduled, :scheduled, account:)
				else
					create(:basic_expense_transaction, :flagged, account:, status: 'Cleared') # flagged and cleared
					create(:basic_income_transaction, account:)
					create(:transfer_transaction, source_account: account)
					create(:transfer_transaction, destination_account: account)
					create(:split_to_transaction, account:, subtransactions: 1, subtransfers: 1)
					create(:split_from_transaction, account:, subtransactions: 1, subtransfers: 1)
					create(:subtransfer_to_transaction, account:)
					create(:subtransfer_from_transaction, account:)
					create(:payslip_transaction, account:, subtransactions: 1, subtransfers: 1)
					create(:loan_repayment_transaction, account:, subtransactions: 1, subtransfers: 1)
					create(:security_purchase_transaction, cash_account: account)
					create(:security_sale_transaction, cash_account: account)
					create(:dividend_transaction, cash_account: account)

					# Create any scheduled transactions
					create_list(:basic_transaction, evaluator.scheduled, :scheduled, account:)
				end
			end
		end

		after :build do |account, evaluator|
			create_list(:basic_transaction, evaluator.transactions, :flagged, account:)
			create_list(:basic_transaction, evaluator.reconciled, account:, status: 'Reconciled')
		end

		trait :asset do
			account_type { 'asset' }
		end

		trait :credit do
			account_type { 'credit' }
		end

		trait :investment do
			account_type { 'investment' }
			opening_balance { 0 }

			transient do
				related_account { ::FactoryBot.build(:bank_account) }
			end

			after :build do |account, evaluator|
				account.related_account = evaluator.related_account
			end
		end

		trait :cash do
			account_type { 'cash' }
		end

		trait :loan do
			account_type { 'loan' }

			transient do
				related_account { nil }
			end

			after :build do |account, evaluator|
				account.related_account = evaluator.related_account
			end
		end

		trait :closed do
			status { 'closed' }
		end

		trait :favourite do
			favourite { true }
		end

		factory :asset_account, traits: [:asset]
		factory :credit_account, traits: [:credit]
		factory :investment_account, traits: [:investment]
		factory :cash_account, traits: [:cash]
		factory :loan_account, traits: [:loan]
		factory :closed_account, traits: [:closed]
		factory :favourite_account, traits: [:favourite]
	end
end
