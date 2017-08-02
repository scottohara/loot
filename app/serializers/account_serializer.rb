# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Account serializer
class AccountSerializer < ActiveModel::Serializer
	attributes :id, :name, :account_type, :status, :num_transactions, :favourite
	attribute :opening_balance { object.opening_balance.to_f }
	attribute :closing_balance { object.closing_balance.to_f }
	attribute :related_account { object&.related_account&.as_json fields: %i[id name account_type opening_balance status] }

	def num_transactions
		object.transactions.count
	end
end
