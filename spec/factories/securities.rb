FactoryGirl.define do
	factory :security do
		sequence(:name) { |n| "Security #{n}" }
		sequence(:code, "A") { |n| n }
	end
end
