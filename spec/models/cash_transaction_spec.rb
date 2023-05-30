# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::CashTransaction do
	matcher :match_json do |expected|
		match do |actual|
			actual.amount.eql? expected['amount']
		end
	end

	describe '::create_from_json' do
		let(:json) { {'amount' => 1} }

		it 'should create a transaction from a JSON representation' do
			expect(described_class.create_from_json json).to match_json json
		end
	end

	describe '#update_from_json' do
		subject(:transaction) { described_class.new amount: 1 }

		let(:json) { {'amount' => 2} }

		it 'should update a transaction from a JSON representation' do
			expect(transaction.update_from_json json).to match_json json
		end
	end

	describe '#as_json' do
		subject(:transaction) { create(:basic_transaction) }

		let(:json) { transaction.as_json }

		it 'should return a JSON representation' do
			expect(json).to include amount: 1
		end
	end
end
