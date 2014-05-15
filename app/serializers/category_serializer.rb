class CategorySerializer < ActiveModel::Serializer
	has_many :children
  attributes :id, :name, :direction, :parent_id
end
