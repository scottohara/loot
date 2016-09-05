# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Favouritable
module Favouritable
	extend ActiveSupport::Concern
	include ActiveModel::Validations

	included do
		validates :favourite, inclusion: {in: [true, false]}
	end
end
