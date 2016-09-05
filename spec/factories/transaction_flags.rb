# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true
FactoryGirl.define do
	factory :transaction_flag do
		sequence(:memo) { |n| "Flag #{n}" }

		transient do
			trx { FactoryGirl.build :transaction }
		end

		after :build do |flag, evaluator|
			flag.trx = evaluator.trx
		end
	end
end
