FactoryGirl.define do
	factory :category, aliases: [:outflow_category] do
		sequence(:name) { |n| "Category #{n}" }
		outflow

		ignore do
			transactions 0
			children 0
		end

		trait :with_all_transaction_types do
			after :build do |category|
				create(:basic_transaction, :flagged, category: category, status: "Cleared")			#flagged and cleared
				create(:split_transaction, direction: category.direction, category: category, subtransactions: 1)
			end
		end

		after :build do |category, evaluator|
			create_list :basic_transaction, evaluator.transactions, category: category
			create_list :category, evaluator.children, parent: category
		end

		trait :outflow do
			direction "outflow"
		end

		trait :inflow do
			direction "inflow"
		end

		trait :parent_category do
			after :build do |category|
				category.parent = FactoryGirl.build :category, category.direction.to_sym
			end
		end

		trait :with_children do
			children 2
		end

		factory :inflow_category, traits: [:inflow]
		factory :subcategory, traits: [:parent_category]
		factory :inflow_subcategory, traits: [:inflow, :parent_category]
		factory :category_with_children, traits: [:with_children]
	end
end