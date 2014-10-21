FactoryGirl.define do
	factory :account, aliases: [:bank_account] do
		account_type "bank"
		sequence(:name) { |n| "#{account_type} account #{n}" }
		opening_balance 1000
		status "open"

		ignore do
			transactions 0
			reconciled 0
			scheduled 0
		end

		trait :with_all_transaction_types do
			after :build do |account, evaluator|
				if account.account_type.eql? "investment"
					create(:security_purchase_transaction, :flagged, investment_account: account, cash_account: account.related_account, status: "Cleared")		# flagged and cleared
					create(:security_sale_transaction, investment_account: account, cash_account: account.related_account)
					create(:security_transfer_transaction, source_account: account)
					create(:security_transfer_transaction, destination_account: account)
					create(:security_add_transaction, account: account)
					create(:security_remove_transaction, account: account)
					create(:dividend_transaction, investment_account: account, cash_account: account.related_account)
					
					# Create any scheduled transactions
					create_list :security_holding_transaction, evaluator.scheduled, :scheduled, account: account
				else
					create(:basic_expense_transaction, :flagged, account: account, status: "Cleared")			#flagged and cleared
					create(:basic_income_transaction, account: account)
					create(:transfer_transaction, source_account: account) 
					create(:transfer_transaction, destination_account: account) 
					create(:split_to_transaction, account: account, subtransactions: 1, subtransfers: 1)
					create(:split_from_transaction, account: account, subtransactions: 1, subtransfers: 1)
					create(:subtransfer_to_transaction, account: account)
					create(:subtransfer_from_transaction, account: account)
					create(:payslip_transaction, account: account, subtransactions: 1, subtransfers: 1)
					create(:loan_repayment_transaction, account: account, subtransactions: 1, subtransfers: 1)
					create(:security_purchase_transaction, cash_account: account)
					create(:security_sale_transaction, cash_account: account)
					create(:dividend_transaction, cash_account: account) 
	
					# Create any scheduled transactions
					create_list :basic_transaction, evaluator.scheduled, :scheduled, account: account
				end
			end
		end

		after :build do |account, evaluator|
			create_list :basic_transaction, evaluator.transactions, account: account
			create_list :basic_transaction, evaluator.reconciled, account: account, status: "Reconciled"
		end

		trait :credit do
			account_type "credit"
		end

		trait :investment do
			account_type "investment"
			opening_balance 0

			ignore do
				related_account { FactoryGirl.build(:bank_account) }
			end

			after :build do |account, evaluator|
				account.related_account = evaluator.related_account
			end
		end

		trait :cash do
			account_type "cash"
		end

		trait :loan do
			account_type "loan"
		end

		trait :closed do
			status "closed"
		end

		factory :credit_account, traits: [:credit]
		factory :investment_account, traits: [:investment]
		factory :cash_account, traits: [:cash]
		factory :loan_account, traits: [:loan]
		factory :closed_account, traits: [:closed]
	end
end
