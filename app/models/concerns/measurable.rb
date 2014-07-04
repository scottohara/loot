module Measurable
	extend ActiveSupport::Concern

	# Methods for measuring things, in particular date periods

	module ClassMethods
		# Fortnights since a given date
		def fortnights_since(date)
			((Date.today - date) / 14).to_i
		end

		# Months since a given date
		def months_since(date)
			months = ((Date.today.year - date.year) * 12) + (Date.today.month - date.month)
			months = months - 1 if Date.today.day < date.day
			months
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
				when 'Fortnightly' then fortnights_since date
				when 'Monthly' then months_since date
				when 'Quarterly' then quarters_since date
				when 'Yearly' then years_since date
			end
		end
	end
end
