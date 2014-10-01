FactoryGirl.define do
	factory :split_transaction do
		# Default attributes for payee cash transaction
		payee_cash_transaction

		# Default account, subtransactions and subtransfers if none specified
		ignore do
			account { FactoryGirl.build(:account) }
			subtransactions 0
			subtransfers 0
		end

		after :build do |trx, evaluator|
			trx.transaction_account = FactoryGirl.build :transaction_account, account: evaluator.account
			create_list :sub_transaction, evaluator.subtransactions, parent: trx
			create_list :subtransfer_transaction, evaluator.subtransfers, parent: trx, payee: evaluator.payee
		end

		trait :payslip do
			transaction_type "Payslip"
		end

		trait :loan_repayment do
			transaction_type "LoanRepayment"
		end

		factory :payslip_transaction, traits: [:payslip]
		factory :loan_repayment_transaction, traits: [:loan_repayment]
	end
end
