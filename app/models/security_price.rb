class SecurityPrice < ActiveRecord::Base
	validates :price, presence: true
	validates :as_at_date, presence: true
	belongs_to :security
end
