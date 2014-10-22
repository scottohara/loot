class Security < ActiveRecord::Base
	validates :name, :presence => true
	has_many :prices, :class_name => 'SecurityPrice', :dependent => :destroy
	has_many :security_transaction_headers
	has_many :transactions, :through => :security_transaction_headers, :source => :trx do
		def for_ledger(opts)
			joins([	"LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id"])
		end

		def for_closing_balance(opts)
			joins([	"JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
					 		"JOIN accounts ON accounts.id = transaction_accounts.account_id"])
			.where(	"accounts.account_type = 'investment'")
		end
	end

	include Transactable

	class << self
		def find_or_new(security)
			security['id'].present? ? self.find(security['id']) : self.new(:name => security)
		end

		def list
			securities = ActiveRecord::Base.connection.execute <<-query
				SELECT		securities.id,
									securities.name,
									securities.code,
									ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END),3) AS current_holding,
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
				WHERE			transaction_headers.transaction_date IS NOT NULL AND
									transactions.transaction_type IN ('SecurityInvestment', 'SecurityTransfer', 'SecurityHolding') AND
									accounts.account_type = 'investment'
				GROUP BY	securities.id
				ORDER BY	CASE WHEN ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END),3) > 0 THEN 0 ELSE 1 END,
									securities.name
			query

			# Remap to the desired output format
			security_list = securities.map do |security|
				{
					:id => security['id'].to_i,
					:name => security['name'],
					:code => security['code'],
					:current_holding => security['current_holding'],
					:current_value => security['current_value']
				}
			end

			unused_securities = self
				.joins(		"LEFT OUTER JOIN transaction_headers ON transaction_headers.security_id = securities.id AND transaction_headers.transaction_date IS NOT NULL")
				.group(		:id)
				.having(	"COUNT(transaction_headers.transaction_id) = 0")
				.order(:name)

			security_list + unused_securities.map do |security|
				{
					:id => security['id'].to_i,
					:name => security['name'],
					:code => security['code'],
					:current_holding => 0,
					:current_value => 0,
					:unused => true
				}
			end
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

	def opening_balance
		0
	end

	def account_type
		"investment"
	end

	def related_account
		nil
	end

	def as_json(options={})
		# Defer to serializer
		SecuritySerializer.new(self).as_json options
	end
end
