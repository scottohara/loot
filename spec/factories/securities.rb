# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

FactoryBot.define do
	factory :security do
		sequence(:name) { |n| "Security #{n}" }
		sequence(:code, 'A') { |n| n }

		transient do
			transactions { 0 }
			scheduled { 0 }
		end

		trait :with_all_transaction_types do
			after :build do |security, evaluator|
				create :security_purchase_transaction, :flagged, security: security, status: 'Cleared' # flagged and cleared
				create :security_sale_transaction, security: security
				create :security_transfer_transaction, security: security
				create :security_add_transaction, security: security
				create :security_remove_transaction, security: security
				create :dividend_transaction, security: security

				# Create any scheduled transactions
				create_list :security_holding_transaction, evaluator.scheduled, :scheduled, security: security
			end
		end

		after :build do |security, evaluator|
			create_list :security_holding_transaction, evaluator.transactions, security: security
		end

		trait :favourite do
			favourite { true }
		end

		factory :favourite_security, traits: [:favourite]
	end
end
