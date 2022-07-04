# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Subtransfer transaction
class SubtransferTransaction < PayeeCashTransaction
	has_one :transaction_split, foreign_key: 'transaction_id', dependent: :delete
	has_one :parent, class_name: 'SplitTransaction', through: :transaction_split
	has_one :transaction_account, foreign_key: 'transaction_id', autosave: true, dependent: :destroy
	has_one :account, through: :transaction_account
	after_initialize do |t|
		t.transaction_type = 'Subtransfer'
	end

	class << self
		def create_from_json(json)
			direction = (json['direction'].eql?('inflow') && 'outflow') || 'inflow'

			s = super
			s.build_transaction_account(direction:, status: json['status']).account = ::Account.find json['account']['id']
			s
		end
	end

	def as_json(options = {})
		super.merge(
			primary_account: account.as_json,
			category: {
				id: (options[:direction].eql?('inflow') && 'TransferFrom') || 'TransferTo',
				name: (options[:direction].eql?('inflow') && 'Transfer From') || 'Transfer To'
			},
			account: parent.account.as_json,
			direction: transaction_account.direction,
			status: transaction_account.status,
			related_status: parent.transaction_account.status,
			parent_id: parent.id
		)
	end
end
