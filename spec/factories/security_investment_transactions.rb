FactoryGirl.define do
	factory :security_investment_transaction do
		# Default attributes for security transaction
		security_transaction
		amount { price * quantity - commission }

		# Default accounts if none specified
		ignore do
			investment_account { FactoryGirl.build(:investment_account, related_account: cash_account) }
			cash_account { FactoryGirl.build(:bank_account) }
			direction { "Buy" }
			price 2
			quantity 10
			commission 19 
			status nil
		end

		after :build do |trx, evaluator|
			trx.header.price = evaluator.price
			trx.header.quantity = evaluator.quantity
			trx.header.commission = evaluator.commission
			trx.transaction_accounts << FactoryGirl.build(:transaction_account, account: evaluator.investment_account, direction: (evaluator.direction.eql?("Buy") ? "inflow" : "outflow"), status: evaluator.status)
			trx.transaction_accounts << FactoryGirl.build(:transaction_account, account: evaluator.cash_account, direction: (evaluator.direction.eql?("Buy") ? "outflow" : "inflow"))
		end
	end
end
