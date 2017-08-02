# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LoanRepaymentTransaction, type: :model do
	describe '#as_json' do
		subject { create :loan_repayment_transaction }
		let(:json) { subject.as_json }

		it 'should return a JSON representation' do
			expect(json).to include category: {id: 'LoanRepayment', name: 'Loan Repayment'}
		end
	end
end
