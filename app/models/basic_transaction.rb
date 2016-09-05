# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Basic transaction
class BasicTransaction < PayeeCashTransaction
	has_one :transaction_account, foreign_key: 'transaction_id', dependent: :destroy, autosave: true
	has_one :account, through: :transaction_account
	has_one :transaction_category, foreign_key: 'transaction_id', dependent: :destroy
	has_one :category, through: :transaction_category
	after_initialize do |t|
		t.transaction_type = 'Basic'
	end

	class << self
		def create_from_json(json)
			category = Category.find_or_new json['category']
			category = Category.find_or_new(json['subcategory'], category) unless json['subcategory'].nil?

			s = super
			s.build_transaction_account(direction: category.direction, status: json['status']).account = Account.find json['primary_account']['id']
			s.build_transaction_category.category = category
			s.save!
			s
		end

		def update_from_json(json)
			s = includes(:header).find json[:id]
			s.update_from_json json
			s
		end
	end

	def update_from_json(json)
		category = Category.find_or_new json['category']
		category = Category.find_or_new(json['subcategory'], category) unless json['subcategory'].nil?

		super
		transaction_account.direction = category.direction
		self.account = Account.find json['primary_account']['id']
		self.category = category
		save!
	end

	def as_json(options = {})
		super.merge(
			primary_account: account.as_json,
			category: category.parent.blank? && category.as_json || category.parent.as_json,
			subcategory: category.parent.present? && category.as_json || nil,
			direction: transaction_account.direction,
			status: transaction_account.status
		)
	end
end
