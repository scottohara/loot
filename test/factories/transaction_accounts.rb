FactoryGirl.define do
	factory :transaction_account do
		direction "outflow"
		account
	end
end
