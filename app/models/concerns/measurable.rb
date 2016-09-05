# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Favouritable
module Measurable
	extend ActiveSupport::Concern

	# Methods for measuring things, in particular date periods
	module ClassMethods
		# Weeks since a given date
		def weeks_since(date)
			((Time.zone.today - date) / 7).to_i
		end

		# Fortnights since a given date
		def fortnights_since(date)
			((Time.zone.today - date) / 14).to_i
		end

		# Months since a given date
		def months_since(date)
			months = ((Time.zone.today.year - date.year) * 12) + (Time.zone.today.month - date.month)
			months -= 1 if Time.zone.today.day < date.day
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
			case frequency
			when 'Weekly' then weeks_since date
			when 'Fortnightly' then fortnights_since date
			when 'Monthly' then months_since date
			when 'Bimonthly' then bimonths_since date
			when 'Quarterly' then quarters_since date
			when 'Yearly' then years_since date
			end
		end
	end
end
