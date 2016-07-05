class Category < ApplicationRecord
	validates :name, presence: true
	validates :direction, presence: true, inclusion: {in: %w(inflow outflow)}
	belongs_to :parent, class_name: 'Category', foreign_key: 'parent_id', optional: true
	has_many :children, -> { order(:name) }, class_name: 'Category', foreign_key: 'parent_id', dependent: :destroy
	has_many :transaction_categories, -> (object) { rewhere(category_id: object.children.pluck(:id).unshift(object.id)) }
	has_many :transactions, through: :transaction_categories, source: :trx do
		def for_ledger(opts)
			joins([	"LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id OR transaction_headers.transaction_id = transaction_splits.parent_id"])
			.where(	"transactions.transaction_type != 'Subtransfer'")
		end

		def for_closing_balance(opts)
			joins([	"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id",
							"JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id"])
		end

		def for_basic_closing_balance(opts)
			joins([	"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id",
							"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id OR transaction_headers.transaction_id = transaction_splits.parent_id"])
		end
	end

	include Transactable
	include Favouritable

	class << self
		def find_or_new(category, parent = nil)
			(!category.is_a?(String) && category['id'].present?) ? self.find(category['id']) : self.new(name: category, direction: (!!parent && parent.direction || 'outflow'), parent: parent)
		end
	end

	def opening_balance
		0
	end

	def account_type
		nil
	end

	def as_json(options={only: [:id, :name, :direction, :parent_id, :favourite]})
		# Defer to serializer
		CategorySerializer.new(self, options).as_json
	end
end
