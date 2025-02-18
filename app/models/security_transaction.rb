# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security transaction
class SecurityTransaction < Transaction
	has_one :header, class_name: 'SecurityTransactionHeader', foreign_key: 'transaction_id', dependent: :destroy, autosave: true

	class << self
		def create_from_json(json)
			s = super
			s.build_header.update_from_json json
			s
		end
	end

	def update_from_json(json)
		super
		header.update_from_json json
		self
	end

	def as_json(options = {})
		super.merge header.as_json
	end

	# :nocov:

	private unless ::Rails.env.test?

	# :nocov:end

	def method_missing(method, *args, &)
		validate_method?(method) do |match|
			__send__ :"validate_#{match[2]}", match[1]
			true
		end || super
	end

	def respond_to_missing?(method, include_all = false)
		validate_method?(method) || super
	end

	def validate_method?(method, &)
		/^validate_(.+)_(presence|absence)$/.match method.to_s, &
	end

	def validate_presence(attr)
		errors.add :base, "#{attr.capitalize} can't be blank" if header.public_send(attr).blank? # e.g. header.quantity.blank?
	end

	def validate_absence(attr)
		errors.add :base, "#{attr.capitalize} must be blank" if header.public_send(attr).present? # e.g. header.quantity.blank?
	end
end
