class Category < ActiveRecord::Base
	validates :name, :presence => true
	validates :direction, :presence => true, :inclusion => {:in => %w(inflow outflow)}
	belongs_to :parent, :class_name => 'Category', :foreign_key => 'parent_id'
	has_many :children, :class_name => 'Category', :foreign_key => 'parent_id'
	has_many :transaction_categories
	has_many :transactions, :through => :transaction_categories

	def as_json(options={})
		super :only => [:id, :name, :direction]
	end
end
