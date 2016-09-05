# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Transaction category
class TransactionCategory < ApplicationRecord
	belongs_to :trx, foreign_key: 'transaction_id', class_name: 'Transaction'
	belongs_to :category
	self.primary_key = 'transaction_id'
end
