# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :transaction_flag do
		sequence(:memo) { "Flag #{_1}" }

		transient do
			trx { ::FactoryBot.build(:transaction) }
		end

		after :build do |flag, evaluator|
			flag.trx = evaluator.trx
		end
	end
end
