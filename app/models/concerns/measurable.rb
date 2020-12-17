# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Measurable
module Measurable
	extend ::ActiveSupport::Concern

	Frequency = ::Struct.new :advance_by, :periods_since
	private_constant :Frequency

	FREQUENCIES = {
		Weekly: Frequency.new({weeks: 1}, :weeks_since),
		Fortnightly: Frequency.new({weeks: 2}, :fortnights_since),
		Monthly: Frequency.new({months: 1}, :months_since),
		Bimonthly: Frequency.new({months: 2}, :bimonths_since),
		Quarterly: Frequency.new({months: 3}, :quarters_since),
		Yearly: Frequency.new({years: 1}, :years_since)
	}.freeze

	private_constant :FREQUENCIES

	# Methods for measuring things, in particular date periods
	class_methods do
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

		def periods_since(frequency, date)
			public_send FREQUENCIES[frequency.to_sym].periods_since, date
		end

		def advance_by(frequency, date)
			date.advance FREQUENCIES[frequency.to_sym].advance_by
		end
	end
end
