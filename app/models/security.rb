class Security < ActiveRecord::Base
	validates :name, :presence => true
	has_many :prices, :class_name => 'SecurityPrice', :dependent => :destroy
	has_many :security_transaction_headers
	has_many :transactions, :through => :security_transaction_headers

	class << self
		def find_or_new(security)
			security['id'].present? ? self.find(security['id']) : self.new(:name => security)
		end

		def security_list
			ActiveRecord::Base.connection.execute <<-query
				SELECT		securities.id,
									securities.name,
									securities.code,
									SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END) AS current_holding,
									ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END) * MAX(p.price),2) AS current_value
				FROM			securities
				JOIN			transaction_headers ON transaction_headers.security_id = securities.id
				JOIN			transaction_accounts ON transaction_accounts.transaction_id = transaction_headers.transaction_id
				JOIN			transactions ON transactions.id = transaction_headers.transaction_id
				JOIN			accounts ON accounts.id = transaction_accounts.account_id
				JOIN			(	SELECT		sp.security_id,
															sp.price
										FROM			security_prices sp
										JOIN			(	SELECT		security_id,
																					MAX(as_at_date) AS as_at_date
																FROM			security_prices
																GROUP BY	security_id
															) d ON sp.security_id = d.security_id AND sp.as_at_date = d.as_at_date
									) p ON securities.id = p.security_id
				WHERE			transactions.transaction_type IN ('SecurityInvestment', 'SecurityTransfer', 'SecurityHolding') AND
									transaction_headers.transaction_date IS NOT NULL AND
									accounts.account_type = 'investment'
				GROUP BY	securities.id
				ORDER BY	CASE WHEN SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END) > 0 THEN 0 ELSE 1 END,
									securities.name
			query
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
		super :only => [:id, :name, :code]
	end
end
