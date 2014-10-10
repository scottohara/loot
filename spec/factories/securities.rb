FactoryGirl.define do
	factory :security do
		sequence(:name) { |n| "Security #{n}" }
		sequence(:code, "A") { |n| n }

		ignore do
			transactions 0
		end

		trait :with_all_transaction_types do
			after :build do |security|
				create(:security_purchase_transaction, :flagged, security: security, status: "Cleared")		# flagged and cleared
				create(:security_sale_transaction, security: security)
				create(:security_transfer_transaction, security: security)
				create(:security_add_transaction, security: security)
				create(:security_remove_transaction, security: security)
				create(:dividend_transaction, security: security)
			end
		end

		after :build do |security, evaluator|
			create_list :security_holding_transaction, evaluator.transactions, security: security
		end
	end
end