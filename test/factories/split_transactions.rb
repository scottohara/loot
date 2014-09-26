FactoryGirl.define do
	factory :split_transaction do
		# Default attributes for payee cash transaction
		payee_cash_transaction

		# Default account, subtransactions and subtransfers if none specified
		ignore do
			account { FactoryGirl.build(:account) }
			#TODO - subtransactions, subtransfers
		end

		after :build do |trx, evaluator|
			trx.transaction_account = FactoryGirl.build :transaction_account, account: evaluator.account
		end
	end
end
