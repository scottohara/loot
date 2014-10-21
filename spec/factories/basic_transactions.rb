FactoryGirl.define do
	factory :basic_transaction, aliases: [:basic_expense_transaction] do
		# Default attributes for payee cash transaction
		payee_cash_transaction

		# Default account and category if none specified
		ignore do
			account { FactoryGirl.build(:account) }
			category { FactoryGirl.build(:category) }
			status nil
		end

		after :build do |trx, evaluator|
			trx.transaction_account = FactoryGirl.build :transaction_account, account: evaluator.account, direction: evaluator.category.direction, status: evaluator.status
			trx.category = evaluator.category
		end

		trait :inflow do
			category { FactoryGirl.build(:inflow_category) }
		end

		trait :scheduled do
			ignore do
				next_due_date { Date.today.advance({:months => -1}) }
				frequency "Monthly"
				auto_enter true
			end

			after :build do |trx, evaluator|
				trx.header.transaction_date = nil
				trx.header.schedule = build :schedule, next_due_date: evaluator.next_due_date, frequency: evaluator.frequency, auto_enter: evaluator.auto_enter
			end
		end

		factory :basic_income_transaction, traits: [:inflow]
	end
end
