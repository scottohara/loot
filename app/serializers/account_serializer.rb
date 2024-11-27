# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Account serializer
class AccountSerializer < ::ActiveModel::Serializer
	attributes :id, :name, :account_type, :status, :favourite
	attribute(:opening_balance) { object.opening_balance.to_f }
	attribute(:closing_balance) { object.closing_balance.to_f }
	attribute(:cleared_closing_balance) { object.closing_balance(status: 'Cleared').to_f - object.opening_balance.to_f }
	attribute(:reconciled_closing_balance) { object.closing_balance(status: 'Reconciled').to_f }
	attribute(:related_account) { object.related_account&.as_json fields: %i[id name account_type opening_balance status] }
	attribute(:num_transactions) { object.transactions.count }
end
