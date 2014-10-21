FactoryGirl.define do
	factory :security_transfer_transaction do
		# Default attributes for security transaction
		security_transaction

		# Default accounts if none specified
		ignore do
			source_account { FactoryGirl.build(:investment_account) }
			destination_account { FactoryGirl.build(:investment_account) }
			quantity 10
			status nil
		end

		after :build do |trx, evaluator|
			trx.header.quantity = evaluator.quantity
			trx.source_transaction_account = FactoryGirl.build :transaction_account, account: evaluator.source_account, direction: "outflow", status: evaluator.status
			trx.destination_transaction_account = FactoryGirl.build :transaction_account, account: evaluator.destination_account, direction: "inflow"
		end

		trait :scheduled do
			ignore do
				next_due_date { Date.today.advance({:months => -1}) }
			end

			after :build do |trx, evaluator|
				trx.header.transaction_date = nil
				trx.header.schedule = build :schedule, next_due_date: evaluator.next_due_date
			end
		end
	end
end
