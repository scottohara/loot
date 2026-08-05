# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::SecurityTransaction do
	describe '::create_from_json' do
		let(:json) { {} }

		before do
			expect_any_instance_of(::SecurityTransactionHeader).to receive(:update_from_json).with json
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

	describe 'attribute validations' do
		subject(:transaction) { described_class.new }

		before do
			transaction.build_header
		end

		shared_examples 'a presence validation' do
			let(:error_message) { "#{attr.capitalize} can't be blank" }

			it 'should be an error if the attribute is blank' do
				transaction.public_send :"validate_#{attr}_presence"
				expect(transaction.errors[:base]).to include error_message
			end

			it 'should not be an error if the attribute is not blank' do
				transaction.header.public_send :"#{attr}=", 1
				transaction.public_send :"validate_#{attr}_presence"
				expect(transaction.errors[:base]).not_to include error_message
			end
		end

		shared_examples 'an absence validation' do
			let(:error_message) { "#{attr.capitalize} must be blank" }

			it 'should be an error if the attribute is not blank' do
				transaction.header.public_send :"#{attr}=", 1
				transaction.public_send :"validate_#{attr}_absence"
				expect(transaction.errors[:base]).to include error_message
			end

			it 'should not be an error if the attribute is blank' do
				transaction.public_send :"validate_#{attr}_absence"
				expect(transaction.errors[:base]).not_to include error_message
			end
		end

		%w[quantity price commission].each do |attribute|
			context attribute do
				let(:attr) { attribute }

				it_behaves_like 'a presence validation'
				it_behaves_like 'an absence validation'
			end
		end
	end

	describe '#as_json' do
		subject(:transaction) { create :security_holding_transaction }

		let(:json) { transaction.as_json }

		before do
			expect(transaction.header).to receive(:as_json).and_return header: 'header json'
		end

		it 'should return a JSON representation' do
			expect(json).to include header: 'header json'
		end
	end
end
