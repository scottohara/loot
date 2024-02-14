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

	describe '#method_missing' do
		subject(:transaction) { described_class.new }

		context 'validate presence' do
			it 'should call #validate_presence' do
				expect(transaction).to receive(:validate_presence).with 'foo'
				transaction.validate_foo_presence
			end
		end

		context 'validate absence' do
			it 'should call #validate_absence' do
				expect(transaction).to receive(:validate_absence).with 'foo'
				transaction.validate_foo_absence
			end
		end

		context 'unknown method' do
			it 'should call super' do
				expect_any_instance_of(::Transaction).to receive(:method_missing).with :unknown_method
				transaction.unknown_method
			end
		end
	end

	describe '#respond_to_missing?' do
		subject(:transaction) { described_class.new }

		context 'validate presence' do
			it 'should respond' do
				expect(transaction.respond_to? :validate_foo_presence).to be true
			end
		end

		context 'validate absence' do
			it 'should respond' do
				expect(transaction.respond_to? :validate_foo_absence).to be true
			end
		end

		context 'unknown method' do
			it 'should call super' do
				expect(transaction.respond_to? :unknown_method).to be false
			end
		end
	end

	describe '#validate_presence' do
		subject(:transaction) { described_class.new }

		let(:error_message) { "Price can't be blank" }

		before do
			transaction.build_header
		end

		it 'should be an error if the attribute is blank' do
			transaction.validate_presence 'price'
			expect(transaction.errors[:base]).to include error_message
		end

		it 'should not be an error if the attribute is not blank' do
			transaction.header.price = 1
			transaction.validate_presence 'price'
			expect(transaction.errors[:base]).not_to include error_message
		end
	end

	describe '#validate_absence' do
		subject(:transaction) { described_class.new }

		let(:error_message) { 'Price must be blank' }

		before do
			transaction.build_header
		end

		it 'should be an error if the attribute is not blank' do
			transaction.header.price = 1
			transaction.validate_absence 'price'
			expect(transaction.errors[:base]).to include error_message
		end

		it 'should not be an error if the attribute is blank' do
			transaction.validate_absence 'price'
			expect(transaction.errors[:base]).not_to include error_message
		end
	end

	describe '#as_json' do
		subject(:transaction) { create(:security_holding_transaction) }

		let(:json) { transaction.as_json }

		before do
			expect(transaction.header).to receive(:as_json).and_return header: 'header json'
		end

		it 'should return a JSON representation' do
			expect(json).to include header: 'header json'
		end
	end

	describe '#validate_method?' do
		subject(:transaction) { described_class.new }

		shared_examples 'a match' do
			it 'should return the match' do
				match = transaction.validate_method? :"validate_foo_#{type}"
				expect(match).to be_a ::MatchData
				expect(match[1]).to eql 'foo'
				expect(match[2]).to eql type
			end
		end

		context 'validate presence' do
			let(:type) { 'presence' }

			it_behaves_like 'a match'
		end

		context 'validate absence' do
			let(:type) { 'absence' }

			it_behaves_like 'a match'
		end

		context 'unknown method' do
			it 'should be false' do
				expect(transaction.validate_method? :unknown_method).to be_nil
			end
		end
	end
end
