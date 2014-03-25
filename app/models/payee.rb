class Payee < ActiveRecord::Base
	validates :name, :presence => true
	has_many :payee_transaction_headers

	class << self
		def find_or_new(payee)
			payee['id'].present? ? self.find(payee['id']) : self.new(:name => payee)
		end
	end

	def as_json(options={})
		super :only => [:id, :name]
	end
end
