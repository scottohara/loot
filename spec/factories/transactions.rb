FactoryGirl.define do
	trait :amount do
		amount 1
	end

	trait :memo do
		memo { "#{transaction_type} transaction" }
	end

	trait :flagged do
		after :build do |trx|
			trx.flag = FactoryGirl.build :transaction_flag
		end
	end
end
