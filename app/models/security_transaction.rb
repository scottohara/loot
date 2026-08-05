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

	%i[quantity price commission].each do |attr|
		define_method :"validate_#{attr}_presence" do
			errors.add :base, "#{attr.capitalize} can't be blank" if header.public_send(attr).blank?
		end

		define_method :"validate_#{attr}_absence" do
			errors.add :base, "#{attr.capitalize} must be blank" if header.public_send(attr).present?
		end
	end
end
