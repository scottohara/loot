FactoryGirl.define do
	factory :subtransfer_transaction do
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
			trx.transaction_account = FactoryGirl.build :transaction_account, account: evaluator.account, direction: (evaluator.parent.transaction_account.direction.eql?("inflow") && "outflow" || "inflow")
		end
	end
end
