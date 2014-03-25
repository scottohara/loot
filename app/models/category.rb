class Category < ActiveRecord::Base
	validates :name, :presence => true
	validates :direction, :presence => true, :inclusion => {:in => %w(inflow outflow)}
	belongs_to :parent, :class_name => 'Category', :foreign_key => 'parent_id'
	has_many :children, :class_name => 'Category', :foreign_key => 'parent_id'
	has_many :transaction_categories
	has_many :transactions, :through => :transaction_categories

	class << self
		def find_or_new(category, parent = nil)
			category['id'].present? ? self.find(category['id']) : self.new(:name => category, :direction => (!!parent && parent.direction || 'outflow'), :parent => parent)
		end
	end

	def as_json(options={})
		super :only => [:id, :name, :direction, :parent_id]
	end
end
