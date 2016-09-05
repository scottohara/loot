# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security serializer
class SecuritySerializer < ActiveModel::Serializer
	attributes :id, :name, :code, :current_holding, :closing_balance, :num_transactions, :unused, :favourite

	def current_holding
		object.transactions.for_current_holding.reduce(0) do |holding, security|
			holding + security.total_quantity * (security.direction.eql?('inflow') ? 1 : -1)
		end
	end

	def num_transactions
		object.transactions.count
	end

	def unused
		object.transactions.count.eql? 0
	end
end
