# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Category serializer
class CategorySerializer < ActiveModel::Serializer
	# Only serialize children if eagerly loaded
	has_many :children, if: -> { !object.parent && object.children.loaded? }
	attributes :id, :name, :direction, :parent_id, :num_children, :closing_balance, :num_transactions, :favourite
	attribute(:parent) { object&.parent&.as_json fields: %i[id name direction] }

	def num_children
		object.children.size
	end

	def num_transactions
		object.transactions.count
	end
end
