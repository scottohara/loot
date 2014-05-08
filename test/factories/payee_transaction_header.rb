FactoryGirl.define do
	factory :payee_transaction_header, aliases: [:header] do
		sequence(:transaction_date) { |n| "2014-01-#{n.to_s.rjust(2, '0')}" }
		association :payee, strategy: :build
	end
end
