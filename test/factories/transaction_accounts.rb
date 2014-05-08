FactoryGirl.define do
	factory :transaction_account, aliases: [:outflow_account] do
		direction "outflow"
		association :account, strategy: :build

		trait :inflow do
			direction "inflow"
		end

		factory :inflow_account, traits: [:inflow]
	end
end
