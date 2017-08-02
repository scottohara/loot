# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

FactoryGirl.define do
	trait :security_transaction do
		memo

		# Default security if none specified
		transient do
			security { FactoryGirl.build :security }
		end

		after :build do |trx, evaluator|
			trx.header = FactoryGirl.build :security_transaction_header, security: evaluator.security
		end
	end
end
