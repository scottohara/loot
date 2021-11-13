# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Sub transaction
class SubTransaction < CashTransaction
	has_one :transaction_split, foreign_key: 'transaction_id', dependent: :delete
	has_one :parent, class_name: 'SplitTransaction', through: :transaction_split
	has_one :transaction_category, foreign_key: 'transaction_id', dependent: :destroy
	has_one :category, through: :transaction_category
	after_initialize do |t|
		t.transaction_type = 'Sub'
	end

	class << self
		def create_from_json(json)
			category = ::Category.find_or_new json['category']
			category = ::Category.find_or_new json['subcategory'], category if json['subcategory'].present?

			s = super
			s.build_transaction_category.category = category
			s
		end
	end

	def as_json(options = {})
		super.merge parent.header.as_json.merge(
			primary_account: parent.account.as_json,
			category: (category.parent.blank? && category.as_json) || category.parent.as_json,
			subcategory: (category.parent.present? && category.as_json) || nil,
			direction: parent.transaction_account.direction,
			parent_id: parent.id
		)
	end
end
