FactoryGirl.define do
	factory :transfer_transaction do
		# Default attributes for payee cash transaction
		payee_cash_transaction

		# Default accounts if none specified
		ignore do
			source_account { FactoryGirl.build(:account) }
			destination_account { FactoryGirl.build(:account) }
			status nil
		end

		after :build do |trx, evaluator|
			trx.source_transaction_account = FactoryGirl.build :transaction_account, account: evaluator.source_account, direction: "outflow", status: evaluator.status
			trx.destination_transaction_account = FactoryGirl.build :transaction_account, account: evaluator.destination_account, direction: "inflow"
		end
	end
end
