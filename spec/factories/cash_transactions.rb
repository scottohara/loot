# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true
FactoryGirl.define do
	trait :cash_transaction do
		amount
		memo
	end
end
