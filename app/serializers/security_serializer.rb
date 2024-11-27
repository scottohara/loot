# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security serializer
class SecuritySerializer < ::ActiveModel::Serializer
	attributes :id, :name, :code, :closing_balance, :favourite
	attribute(:current_holding) {	object.transactions.for_current_holding.reduce(0) { |acc, elem| acc + (elem.total_quantity * (elem.direction.eql?('inflow') ? 1 : -1)) } }
	attribute(:num_transactions) { object.transactions.count }
	attribute(:unused) { object.transactions.count.eql? 0 }
end
