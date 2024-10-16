# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Transaction flag
class TransactionFlag < ApplicationRecord
	belongs_to :trx, foreign_key: 'transaction_id', class_name: 'Transaction', inverse_of: :flag
	self.primary_key = 'transaction_id'
	enum :flag_type,
						{
							followup: 'followup',
							noreceipt: 'noreceipt',
							taxdeductible: 'taxdeductible'
						}
end
