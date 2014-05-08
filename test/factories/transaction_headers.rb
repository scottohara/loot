FactoryGirl.define do
	factory :transaction_header do
		sequence(:transaction_date) { |n| "2014-01-#{n.to_s.rjust(2, '0')}" }
	end
end
