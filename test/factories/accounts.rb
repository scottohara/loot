FactoryGirl.define do
	factory :account, aliases: [:bank_account] do
		account_type "bank"
		sequence(:name) { "Test #{account_type} account" }
		opening_balance 1000
		status "open"

		trait :credit do
			account_type "credit"
		end

		trait :investment do
			account_type "investment"
			opening_balance 0
			after(:build) do |account|
				account.related_account = build(:cash_account)
				account.related_account.related_account = account
			end
		end

		trait :cash do
			account_type "cash"
		end

		trait :loan do
			account_type "loan"
		end

		trait :closed do
			status "closed"
		end

		factory :credit_account, traits: [:credit]
		factory :investment_account, traits: [:investement]
		factory :cash_account, traits: [:cash]
		factory :loan_account, traits: [:loan]
		factory :closed_account, traits: [:closed]
	end
end
