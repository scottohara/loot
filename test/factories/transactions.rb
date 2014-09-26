FactoryGirl.define do
	trait :amount do
		amount 1
	end

	trait :memo do
		memo { "#{transaction_type} transaction" }
	end
end
