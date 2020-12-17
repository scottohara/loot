# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# ApplicationRecord
class ApplicationRecord < ::ActiveRecord::Base
	self.abstract_class = true
end
