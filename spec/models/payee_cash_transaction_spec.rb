# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::PayeeCashTransaction, type: :model do
	describe '::create_from_json' do
		let(:json) { {} }

		before do
			expect_any_instance_of(::PayeeTransactionHeader).to receive(:update_from_json).with json
		end

		it 'should create a transaction from a JSON representation' do
			described_class.create_from_json json
		end
	end

	describe '#update_from_json' do
		subject(:transaction) { described_class.new }

		let(:json) { {} }

		before do
			transaction.build_header
			expect(transaction.header).to receive(:update_from_json).with json
		end

		it 'should update a transaction from a JSON representation' do
			transaction.update_from_json json
		end
	end

	describe '#as_json' do
		subject(:transaction) { create :basic_transaction }

		let(:json) { transaction.as_json }

		before do
			expect(transaction.header).to receive(:as_json).and_return header: 'header json'
		end

		it 'should return a JSON representation' do
			expect(json).to include header: 'header json'
		end
	end
end
