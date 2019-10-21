# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SecurityTransactionHeader, type: :model do
	matcher :match_json do |expected, security|
		match do |actual|
			actual.quantity.eql?(expected['quantity']) &&
				actual.price.eql?(expected['price']) &&
				actual.commission.eql?(expected['commission']) &&
				actual.security.eql?(security)
		end
	end

	describe '#update_from_json' do
		let(:security) { create :security }
		let(:header) { create :security_transaction_header }
		let(:json) do
			{
				'quantity' => 1,
				'price' => 1,
				'commission' => 1,
				'security' => {
					'id' => security.id
				}
			}
		end

		before do
			expect(Security).to receive(:find_or_new).and_return security
		end

		it 'should update a transaction header from a JSON representation' do
			expect(header.update_from_json json).to match_json json, security
		end
	end

	describe '#as_json' do
		subject(:transaction_header) { create :security_transaction_header }

		let(:json) { transaction_header.as_json }

		before do
			expect(transaction_header.security).to receive(:as_json).and_return 'security json'
		end

		it 'should return a JSON representation' do
			expect(json).to include security: 'security json'
		end
	end
end
