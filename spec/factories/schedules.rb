# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::FactoryBot.define do
	factory :schedule do
		sequence(:next_due_date) { (::Date.parse('2013-12-31') + _1).to_s }
		frequency { 'Monthly' }
		estimate { true }
		auto_enter { true }
	end
end
