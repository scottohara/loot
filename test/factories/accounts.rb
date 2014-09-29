FactoryGirl.define do
	factory :account, aliases: [:bank_account] do
		account_type "bank"
		sequence(:name) { |n| "#{account_type} account #{n}" }
		opening_balance 1000
		status "open"

		ignore do
			num_transactions 0
		end

		after :build do |account, evaluator|
			create_list :basic_transaction, evaluator.num_transactions, account: account
		end

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
		factory :investment_account, traits: [:investment]
		factory :cash_account, traits: [:cash]
		factory :loan_account, traits: [:loan]
		factory :closed_account, traits: [:closed]
	end
end
