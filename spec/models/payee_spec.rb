# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Payee, type: :model do
	it_behaves_like Transactable do
		let(:context_factory) { :payee }
		let(:ledger_json_key) { :payee }
		let(:expected_closing_balances) { {with_date: -1, without_date: 0} }
	end

	describe '::find_or_new' do
		context 'existing payee' do
			let(:payee) { create :payee }

			it 'should return the existing payee' do
				expect(described_class.find_or_new 'id' => payee.id).to eq payee
			end
		end

		context 'new payee' do
			let(:payee_name) { 'New payee' }

			it 'should return a newly created payee' do
				expect(described_class.find_or_new(payee_name).name).to eq payee_name
			end
		end
	end

	describe '#opening_balance' do
		subject(:payee) { create :payee }

		it 'should return zero' do
			expect(payee.opening_balance).to eq 0
		end
	end

	describe '#account_type' do
		subject(:payee) { create :payee }

		it 'should return nil' do
			expect(payee.account_type).to be_nil
		end
	end

	describe '#as_json' do
		subject(:payee) { create :payee, name: 'Test Payee', transactions: 1 }

		let(:json) { payee.as_json }

		it 'should return a JSON representation' do
			expect(json).to include id: payee.id
			expect(json).to include name: 'Test Payee'
			expect(json).to include closing_balance: payee.closing_balance
			expect(json).to include num_transactions: 1
			expect(json).to include favourite: false
		end
	end
end
