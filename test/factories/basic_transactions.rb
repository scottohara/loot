FactoryGirl.define do
	factory :basic_transaction do

		ignore do
			with_account nil
		end

		amount 100
		memo "Food"
		transaction_type "Basic"
		association :header, strategy: :build
		association :transaction_account, strategy: :build, account: with_account
		association :category, strategy: :build
	end
end
