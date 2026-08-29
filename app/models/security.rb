# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security
class Security < ApplicationRecord
	validates :name, presence: true
	has_many :prices, class_name: 'SecurityPrice', dependent: :destroy
	has_many :security_transaction_headers, dependent: :restrict_with_error
	has_many :transactions, through: :security_transaction_headers, source: :trx do
		def for_ledger(_opts)
			joins 'LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id',
				'LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id',
				'LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id'
		end

		def for_current_holding
			select(
				'transaction_accounts.direction',
				'SUM(transaction_headers.quantity) AS total_quantity'
			)
				.joins(
					'JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id',
					'JOIN accounts ON accounts.id = transaction_accounts.account_id'
				)
				.where('accounts.account_type = \'investment\'')
				.where(transaction_type: ::Transaction::SECURITY_TYPES)
				.where.not('transaction_headers.transaction_date': nil)
				.group 'transaction_accounts.direction'
		end

		def for_closing_balance(_opts)
			joins(
				'JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id',
				'JOIN accounts ON accounts.id = transaction_accounts.account_id'
			)
				.where 'accounts.account_type = \'investment\''
		end
	end

	include ::Transactable
	include ::Favouritable

	class << self
		def find_or_new(security)
			return if security.nil?

			!security.is_a?(::String) && security['id'].present? ? find(security['id']) : new(name: security)
		end

		def list
			securities =
				::ActiveRecord::Base.with_connection do |connection|
					connection.execute <<-QUERY
						SELECT					securities.id,
														securities.name,
														securities.code,
														securities.favourite,
														ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END),4) AS current_holding,
														ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END) * COALESCE(MAX(p.price),0),2) AS closing_balance
						FROM						securities
						JOIN						transaction_headers ON transaction_headers.security_id = securities.id
						JOIN						transaction_accounts ON transaction_accounts.transaction_id = transaction_headers.transaction_id
						JOIN						transactions ON transactions.id = transaction_headers.transaction_id
						JOIN						accounts ON accounts.id = transaction_accounts.account_id
						LEFT OUTER JOIN	(	SELECT		sp.security_id,
																				sp.price
															FROM			security_prices sp
															JOIN			(	SELECT		security_id,
																										MAX(as_at_date) AS as_at_date
																					FROM			security_prices
																					GROUP BY	security_id
																				) d ON sp.security_id = d.security_id AND sp.as_at_date = d.as_at_date
														) p ON securities.id = p.security_id
						WHERE						transaction_headers.transaction_date IS NOT NULL AND
														transactions.transaction_type IN (#{sanitize_sql_array ['?', ::Transaction::SECURITY_TYPES]}) AND
														accounts.account_type = 'investment'
						GROUP BY				securities.id
						ORDER BY				CASE WHEN ROUND(SUM(CASE transaction_accounts.direction WHEN 'inflow' THEN transaction_headers.quantity ELSE transaction_headers.quantity * -1.0 END),4) > 0 THEN 0 ELSE 1 END,
														securities.name
					QUERY
				end

			# Remap to the desired output format
			security_list =
				securities.map do |security|
					{
						id: security['id'].to_i,
						name: security['name'],
						code: security['code'],
						favourite: security['favourite'],
						current_holding: security['current_holding'].to_f,
						closing_balance: security['closing_balance'].to_f,
						unused: false
					}
				end

			unused_securities =
				joins('LEFT OUTER JOIN transaction_headers ON transaction_headers.security_id = securities.id AND transaction_headers.transaction_date IS NOT NULL')
				.group(:id)
				.having('COUNT(transaction_headers.transaction_id) = 0')
				.order :name

			security_list + unused_securities.map do |security|
				{
					id: security['id'].to_i,
					name: security['name'],
					code: security['code'],
					favourite: security['favourite'],
					current_holding: 0,
					closing_balance: 0,
					unused: true
				}
			end
		end
	end

	def price(as_at = ::Time.zone.today.to_s)
		::SecurityPrice.as_at([id], as_at)[id]
	end

	def update_price!(price, as_at_date, transaction_id)
		security_price = prices.find_or_initialize_by(as_at_date:)

		# Only update an existing price if the transaction_id is highest of all for this security/date (best guess at this being the 'most recent' price)
		return if security_price.persisted? && security_transaction_headers.where(transaction_date: as_at_date).exists?(['transaction_id > ?', transaction_id])

		security_price.update! price:
	end

	def opening_balance = 0
	def account_type = 'investment'
	def related_account = nil

	def as_json(options = {only: %i[id name]})
		json = {
			id:,
			name:,
			code:,
			favourite:
		}

		json[:closing_balance] = closing_balance if options[:only].include? :closing_balance
		json[:current_holding] = transactions.for_current_holding.reduce(0) { |acc, elem| acc + (elem.total_quantity * (elem.direction.eql?('inflow') ? 1 : -1)) } if options[:only].include? :current_holding
		json[:num_transactions] = num_transactions if options[:only].include? :num_transactions
		json[:unused] = num_transactions.eql? 0 if options[:only].include? :unused

		json.slice(*options[:only])
	end

	private

	def num_transactions
		@num_transactions ||= transactions.count
	end
end
