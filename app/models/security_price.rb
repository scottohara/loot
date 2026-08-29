# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security price
class SecurityPrice < ApplicationRecord
	validates :price, presence: true
	validates :as_at_date, presence: true
	belongs_to :security

	class << self
		def as_at(security_ids, as_at)
			select('DISTINCT ON (security_id) security_id', :price)
				.where(security_id: security_ids, as_at_date: ..as_at)
				.order(:security_id, as_at_date: :desc)
				.each_with_object(::Hash.new(0)) { |p, prices| prices[p.security_id] = p.price }
		end
	end
end
