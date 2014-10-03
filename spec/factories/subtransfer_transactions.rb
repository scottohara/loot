FactoryGirl.define do
	factory :subtransfer_transaction, aliases: [:subtransfer_to_transaction] do
		# Default attributes for cash transaction
		payee_cash_transaction
		transaction_type "Subtransfer"

		# Default account, subtransactions and subtransfers if none specified
		ignore do
			parent { FactoryGirl.build(:split_transaction) }
			account { FactoryGirl.build(:account) }
		end

		after :build do |trx, evaluator|
			trx.parent = evaluator.parent
			trx.parent.amount = trx.amount
			trx.transaction_account = FactoryGirl.build :transaction_account, account: evaluator.account, direction: (evaluator.parent.transaction_account.direction.eql?("inflow") && "outflow" || "inflow")
		end

		trait :inflow do
			parent { FactoryGirl.build(:split_from_transaction) }
		end

		factory :subtransfer_from_transaction, traits: [:inflow]
	end
end
