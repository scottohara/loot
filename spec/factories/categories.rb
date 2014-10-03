FactoryGirl.define do
	factory :category, aliases: [:outflow_category] do
		ignore do
			transactions 0
		end

		trait :with_all_transaction_types do
			after :build do |category|
				create(:basic_transaction, :flagged, category: category, status: "Cleared")			#flagged and cleared
				create(:split_transaction, direction: category.direction, category: category, subtransactions: 1)
			end
		end

		after :build do |category, evaluator|
			create_list :basic_transaction, evaluator.transactions, category: category
		end

		trait :outflow do
			direction "outflow"
		end

		trait :inflow do
			direction "inflow"
		end

		trait :parent do
			after(:build) do |category|
				category.parent = build(:category, category.direction.to_sym)
			end
		end

		sequence(:name) { |n| "Category #{n}" }
		outflow

		factory :inflow_category, traits: [:inflow]
		factory :subcategory, traits: [:parent]
		factory :inflow_subcategory, traits: [:inflow, :parent]
	end
end
