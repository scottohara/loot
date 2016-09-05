# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Security price
class SecurityPrice < ApplicationRecord
	validates :price, presence: true
	validates :as_at_date, presence: true
	belongs_to :security
end
