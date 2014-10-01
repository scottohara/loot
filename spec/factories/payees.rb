FactoryGirl.define do
	factory :payee do
		sequence(:name) { |n| "Payee #{n}" }
	end
end
