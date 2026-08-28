# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Measurable
module Measurable
	extend ::ActiveSupport::Concern

	Period = ::Struct.new :advance_by, :periods_since
	private_constant :Period

	FREQUENCIES = {
		Weekly: Period.new({weeks: 1}, :weeks_since),
		Fortnightly: Period.new({weeks: 2}, :fortnights_since),
		Monthly: Period.new({months: 1}, :months_since),
		Bimonthly: Period.new({months: 2}, :bimonths_since),
		Quarterly: Period.new({months: 3}, :quarters_since),
		Yearly: Period.new({years: 1}, :years_since)
	}.freeze

	private_constant :FREQUENCIES

	# Methods for measuring things, in particular date periods
	class_methods do
		def frequencies
			FREQUENCIES.keys.map(&:to_s)
		end

		def periods_since(frequency, date)
			public_send period_for(frequency).periods_since, date
		end

		def advance_by(frequency, date)
			date.advance period_for(frequency).advance_by
		end

		# Weeks since a given date
		def weeks_since(date)
			((::Time.zone.today - date) / 7).to_i
		end

		# Fortnights since a given date
		def fortnights_since(date)
			((::Time.zone.today - date) / 14).to_i
		end

		# Months since a given date
		def months_since(date)
			months = ((::Time.zone.today.year - date.year) * 12) + (::Time.zone.today.month - date.month)
			months -= 1 if ::Time.zone.today.day < date.day
			months
		end

		# Bimonths since a given date
		def bimonths_since(date)
			(months_since(date) / 2).to_i
		end

		# Quarters since a given date
		def quarters_since(date)
			(months_since(date) / 3).to_i
		end

		# Years since a given date
		def years_since(date)
			(months_since(date) / 12).to_i
		end

		# :nocov:

		private unless ::Rails.env.test?

		# :nocov:end

		def period_for(frequency)
			FREQUENCIES.fetch(frequency.to_sym) { raise ::ArgumentError, "Invalid frequency: #{frequency}" }
		end
	end
end
