class Security < ActiveRecord::Base
	validates :name, :presence => true
	has_many :prices, :class_name => 'SecurityPrice'
	has_many :security_transaction_headers
end
