class Category < ActiveRecord::Base
	validates :name, :presence => true
	validates :direction, :presence => true, :inclusion => {:in => %w(inflow outflow)}
	belongs_to :parent, :class_name => 'Category', :foreign_key => 'parent_id'
	has_many :children, :class_name => 'Category', :foreign_key => 'parent_id', :dependent => :destroy
	has_many :transaction_categories
	has_many :transactions, :through => :transaction_categories do
		def ledger
			joins([	"LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id"])
			.where(	"transactions.transaction_type != 'Subtransfer'")
		end

		def closing_balance
			joins("JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id")
		end

		def closing_balance_basic
			closing_balance
		end
	end

	include Transactable

	class << self
		def find_or_new(category, parent = nil)
			category['id'].present? ? self.find(category['id']) : self.new(:name => category, :direction => (!!parent && parent.direction || 'outflow'), :parent => parent)
		end
	end

	def opening_balance
		0
	end

	def account_type
		nil
	end
end
