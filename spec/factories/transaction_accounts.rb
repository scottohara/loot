# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true
FactoryGirl.define do
	factory :transaction_account do
		direction 'outflow'
		account
	end
end
