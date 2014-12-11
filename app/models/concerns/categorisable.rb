module Categorisable
	extend ActiveSupport::Concern

	# Methods for determining how to display the category of a transaction
	# All methods expect a hash in the following structure:
	# {
	# 	'transaction_type' => ...
	# 	'parent_transaction_type' => ...
	# 	'category_id' => ...
	# 	'category_name' => ...
	# 	'parent_category_id' => ...
	# 	'parent_category_name' => ...
	# 	'direction' => ...
	# }

	module ClassMethods
		def transaction_category(trx, account_type = nil)
			id, name = case trx['transaction_type']
				when 'Basic', 'Sub' then
					basic_category trx

				when 'Transfer', 'Subtransfer', 'SecurityTransfer' then
					psuedo_category 'Transfer', trx['direction'], trx['parent_transaction_type']

				when 'Split', 'Dividend' then
					psuedo_category trx['transaction_type'], trx['direction']

				when 'LoanRepayment' then
					[trx['transaction_type'], 'Loan Repayment']

				when 'SecurityHolding' then
					trx['direction'].eql?('outflow') && ['RemoveShares', 'Remove Shares'] || ['AddShares', 'Add Shares']

				when 'SecurityInvestment' then
					if account_type.eql? 'investment' 
						trx['direction'].eql?('outflow') && ['Sell', 'Sell'] || ['Buy', 'Buy']
					else
						psuedo_category 'Transfer', trx['direction']
					end

				else
					[trx['transaction_type'], trx['transaction_type']]
			end

			{
				:id => id,
				:name => name
			}
		end

		def basic_category(trx)
			if trx['parent_category_id'].present?
				[trx['parent_category_id'].to_s, trx['parent_category_name']]
			else
				[trx['category_id'].to_s, trx['category_name']]
			end
		end

		def basic_subcategory(trx)
			{
				:id => trx['category_id'].to_s,
				:name => trx['category_name'],
				:parent_id => trx['parent_category_id'].to_s
			} if trx['parent_category_id'].present?
		end

		def psuedo_category(type, direction, parent_type = nil)
			direction = "outflow" if parent_type.eql? 'Payslip'
			suffix = direction.eql?('outflow') && 'To' || 'From'
			[type + suffix, "#{type} #{suffix}"]
		end
	end
end
