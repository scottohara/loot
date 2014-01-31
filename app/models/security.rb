class Security < ActiveRecord::Base
	validates :name, :presence => true
	has_many :prices, :class_name => 'SecurityPrice'
	has_many :security_transaction_headers

	def price(as_at = Date.today.to_s)
		latest = self.prices
			.select("price")
			.where("as_at_date <= '#{as_at}'")
			.order(:as_at_date => :desc)
			.limit(1)
			.first

		!!latest && latest.price || 0
	end
end
