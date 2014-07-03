class CategorySerializer < ActiveModel::Serializer
	has_many :children
  attributes :id, :name, :direction, :parent_id, :num_children, :parent, :closing_balance

	def num_children
		object.children.size
	end

	def parent
		CategorySerializer.new object.parent, :only => [:id, :name, :direction]
	end
end
