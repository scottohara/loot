class Payee < ActiveRecord::Base
	validates :name, :presence => true
	has_many :payee_transaction_headers

	def as_json(options={})
		super :only => [:id, :name]
	end
end
