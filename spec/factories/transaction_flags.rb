# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :transaction_flag do
		sequence(:memo) { "Flag #{it}" }
		trx { ::FactoryBot.build :transaction }
	end
end
