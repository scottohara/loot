class Payee < ActiveRecord::Base
	validates :name, :presence => true
	has_many :payee_transaction_headers
end
