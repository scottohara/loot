# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Category serializer
class CategorySerializer < ::ActiveModel::Serializer
	attributes :id, :name, :direction, :parent_id, :closing_balance, :favourite
	attribute(:parent) { object.parent&.as_json fields: %i[id name direction] }
	attribute(:children, if: -> { !object.parent && object.children.loaded? }) { object.children.as_json fields: %i[id name direction parent_id parent num_transactions favourite] }
	attribute(:num_children) {	object.children.size }
	attribute(:num_transactions) { object.transactions.count }
end
