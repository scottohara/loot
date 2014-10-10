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
	end
end
