# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::PayslipTransaction do
	describe '#as_json' do
		subject { create(:payslip_transaction) }

		let(:json) { subject.as_json }

		it 'should return a JSON representation' do
			expect(json).to include category: {id: 'Payslip', name: 'Payslip'}
		end
	end
end
