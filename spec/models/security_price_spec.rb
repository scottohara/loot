# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::SecurityPrice do
	describe '::as_at' do
		subject(:prices) { described_class.as_at [priced_security.id, unpriced_security.id], as_at }

		let(:as_at) { ::Date.parse '2014-01-01' }
		let(:priced_security) { create :security }
		let(:unpriced_security) { create :security }
		let(:other_security) { create :security }

		before do
			# Prices before the target date
			(1..3).each { |i| described_class.create! security: priced_security, price: i, as_at_date: as_at - i }

			# Prices after the target date
			described_class.create! security: priced_security, price: 999, as_at_date: as_at + 1
			described_class.create! security: unpriced_security, price: 888, as_at_date: as_at + 1

			# Price for a security that wasn't asked for
			described_class.create! security: other_security, price: 500, as_at_date: as_at
		end

		it 'should return the latest price on or before the passed date' do
			expect(prices[priced_security.id]).to eq 1
		end

		it 'should return zero for a security with no price on or before the passed date' do
			expect(prices[unpriced_security.id]).to eq 0
		end

		it 'should not include securities that were not passed' do
			expect(prices.keys).not_to include other_security.id
		end
	end
end
