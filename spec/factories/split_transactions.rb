FactoryGirl.define do
	factory :split_transaction, aliases: [:split_to_transaction] do
		# Default attributes for payee cash transaction
		payee_cash_transaction

		# Default account, subtransactions and subtransfers if none specified
		ignore do
			account { FactoryGirl.build(:account) }
			direction "outflow"
			category { FactoryGirl.build(:category, direction: direction) }
			subtransactions 0
			subtransfers 0
			status nil
		end

		after :build do |trx, evaluator|
			trx.transaction_account = FactoryGirl.build :transaction_account, account: evaluator.account, direction: evaluator.direction, status: evaluator.status
			create_list (evaluator.direction.eql?("outflow") ? :sub_expense_transaction : :sub_income_transaction), evaluator.subtransactions, parent: trx, category: evaluator.category
			create_list :subtransfer_transaction, evaluator.subtransfers, parent: trx, payee: evaluator.payee
			trx.amount = (trx.subtransactions.pluck(:amount).reduce(:+) || 0) + (trx.subtransfers.pluck(:amount).reduce(:+) || 0)
		end

		trait :inflow do
			direction "inflow"
		end

		factory :split_from_transaction, traits: [:inflow]
		factory :payslip_transaction, class: PayslipTransaction, traits: [:inflow]
		factory :loan_repayment_transaction, class: LoanRepaymentTransaction
	end
end