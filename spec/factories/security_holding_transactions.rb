FactoryGirl.define do
	factory :security_holding_transaction do
		# Default attributes for security transaction
		security_transaction

		# Default accounts if none specified
		ignore do
			account { FactoryGirl.build(:investment_account) }
			direction "Add"
			quantity 10
		end

		after :build do |trx, evaluator|
			trx.header.quantity = evaluator.quantity
			trx.transaction_account = FactoryGirl.build(:transaction_account, account: evaluator.account, direction: (evaluator.direction.eql?("Add") ? "inflow" : "outflow"))
		end
	end
end
