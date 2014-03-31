class Security < ActiveRecord::Base
	validates :name, :presence => true
	has_many :prices, :class_name => 'SecurityPrice', :dependent => :destroy
	has_many :security_transaction_headers

	class << self
		def find_or_new(security)
			security['id'].present? ? self.find(security['id']) : self.new(:name => security)
		end
	end

	def price(as_at = Date.today.to_s)
		latest = self.prices
			.select("price")
			.where("as_at_date <= '#{as_at}'")
			.order(:as_at_date => :desc)
			.limit(1)
			.first

		!!latest && latest.price || 0
	end

	def update_price!(price, as_at_date, transaction_id)
		# Check if a price already exists for the transaction date
		security_price = self.prices.where(:as_at_date => as_at_date).first

		if security_price.present?
			# Update the existing price if the transaction_id is highest of all for this security/date (best guess at this being the 'most recent' price)
			security_price.update_column(:price, price) unless self.security_transaction_headers.where(:transaction_date => as_at_date).where("transaction_id > ?", transaction_id).exists?
		else
			# No existing price for this date, so create one
			self.prices.create(:price => price, :as_at_date => as_at_date)
		end
	end

	def as_json(options={})
		super :only => [:id, :name]
	end
end
