# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Payee serializer
class PayeeSerializer < ::ActiveModel::Serializer
	attributes :id, :name, :closing_balance, :favourite
	attribute(:num_transactions) { object.transactions.count }
end
