# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Category serializer
class CategorySerializer < ActiveModel::Serializer
	attributes :id, :name, :direction, :parent_id, :num_children, :closing_balance, :num_transactions, :favourite
	attribute(:parent) { object&.parent&.as_json fields: %i[id name direction] }
	attribute :children, if: :include_children?

	def include_children?
		!object.parent && object.children.loaded?
	end

	def children
		object.children.as_json fields: %i[id name direction parent_id parent num_transactions favourite]
	end

	def num_children
		object.children.size
	end

	def num_transactions
		object.transactions.count
	end
end
