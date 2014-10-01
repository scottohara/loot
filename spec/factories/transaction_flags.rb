FactoryGirl.define do
	factory :transaction_flag do
		sequence(:memo) { |n| "Flag #{n}" }
	end
end
