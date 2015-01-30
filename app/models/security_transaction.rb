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
		self.header.update_from_json json
		self
	end

	def method_missing(method, *args, &block)
		if method.to_s =~ /^validate_(.+)_(presence|absence)$/
			self.send "validate_#{$2}", $1
		else
			super
		end
	end

	def validate_presence(attr)
		errors[:base] << "#{attr.capitalize} can't be blank" if instance_eval "header.#{attr}.blank?"
	end

	def validate_absence(attr)
		errors[:base] << "#{attr.capitalize} must be blank" unless instance_eval "header.#{attr}.blank?"
	end

	def as_json(options={})
		super.merge self.header.as_json
	end
end
