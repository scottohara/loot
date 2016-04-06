module Favouritable
	extend ActiveSupport::Concern
	include ActiveModel::Validations

	included do
		validates :favourite, inclusion: {in: [true, false]}
	end
end
