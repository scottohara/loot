class Payee < ActiveRecord::Base
	attr_accessible :name
	validates :name, :presence => true
	has_many :transaction_headers
end
