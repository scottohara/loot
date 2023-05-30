# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :category, aliases: [:outflow_category] do
		sequence(:name) { |n| "Category #{n}" }
		outflow

		transient do
			transactions { 0 }
			children { 0 }
			scheduled { 0 }
		end

		trait :with_all_transaction_types do
			after :build do |category, evaluator|
				create(:basic_transaction, :flagged, category:, status: 'Cleared') # flagged and cleared
				create(:split_transaction, direction: category.direction, category:, subtransactions: 1)

				# Create any scheduled transactions
				create_list(:basic_transaction, evaluator.scheduled, :scheduled, category:)
			end
		end

		after :build do |category, evaluator|
			create_list(:basic_transaction, evaluator.transactions, category:)
			create_list(:category, evaluator.children, parent: category, direction: category.direction)
		end

		trait :outflow do
			direction { 'outflow' }
		end

		trait :inflow do
			direction { 'inflow' }
		end

		trait :parent_category do
			after :build do |category|
				category.parent = ::FactoryBot.build :category, category.direction.to_sym
			end
		end

		trait :with_children do
			children { 2 }
		end

		trait :favourite do
			favourite { true }
		end

		factory :inflow_category, traits: [:inflow]
		factory :subcategory, traits: [:parent_category]
		factory :inflow_subcategory, traits: %i[inflow parent_category]
		factory :outflow_subcategory, traits: %i[outflow parent_category]
		factory :category_with_children, traits: [:with_children]
		factory :favourite_category, traits: [:favourite]
	end
end
