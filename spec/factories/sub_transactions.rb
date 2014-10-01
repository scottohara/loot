FactoryGirl.define do
	factory :sub_transaction do
		# Default attributes for cash transaction
		cash_transaction
		transaction_type "Sub"

		# Default account, subtransactions and subtransfers if none specified
		ignore do
			parent { FactoryGirl.build(:split_transaction) }
			category { FactoryGirl.build(:category) }
		end

		after :build do |trx, evaluator|
			trx.parent = evaluator.parent
			trx.category = evaluator.category
		end
	end
end
