FactoryGirl.define do
	factory :category, aliases: [:outflow_category] do

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

		sequence(:name) { |n| "Test Category #{n}" }
		outflow

		factory :inflow_category, traits: [:inflow]
		factory :subcategory, traits: [:parent]
		factory :inflow_subcategory, traits: [:inflow, :parent]
	end
end
