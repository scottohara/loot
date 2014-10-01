FactoryGirl.define do
	trait :transaction_date do
		sequence(:transaction_date) { |n| (Date.parse("2013-12-31") + n).to_s }
	end
end
