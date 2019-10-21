# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Security, type: :model do
	before do
		FactoryBot.reload
	end

	it_behaves_like Transactable do
		let(:context_factory) { :security }
		let(:ledger_json_key) { :security }
		let(:expected_closing_balances) { {with_date: 1, without_date: 0} }
	end

	describe '::find_or_new' do
		context 'existing security' do
			let(:security) { create :security }

			it 'should return the existing security' do
				expect(described_class.find_or_new 'id' => security.id).to eq security
			end
		end

		context 'new security' do
			let(:security_name) { 'New security' }

			it 'should return a newly created security' do
				expect(described_class.find_or_new(security_name).name).to eq security_name
			end
		end
	end

	describe '::list' do
		subject(:security) { described_class }

		let!(:another_security) { create :security, :with_all_transaction_types, :favourite, transactions: 1, scheduled: 1 }
		let!(:unused_security) { create :security, :favourite }
		let!(:unused_security_scheduled) { create :security, scheduled: 1 }
		let!(:security_with_prices) { create :security, transactions: 2 }

		let(:json) do
			[
				{
					id: another_security.id,
					name: another_security.name,
					code: another_security.code,
					favourite: another_security.favourite,
					current_holding: '10.000',
					closing_balance: '10.00',
					unused: false
				},
				{
					id: security_with_prices.id,
					name: security_with_prices.name,
					code: security_with_prices.code,
					favourite: security_with_prices.favourite,
					current_holding: '20.000',
					closing_balance: '40.00',
					unused: false
				},
				{
					id: unused_security.id,
					name: unused_security.name,
					code: unused_security.code,
					favourite: unused_security.favourite,
					current_holding: 0,
					closing_balance: 0,
					unused: true
				},
				{
					id: unused_security_scheduled.id,
					name: unused_security_scheduled.name,
					code: unused_security_scheduled.code,
					favourite: unused_security_scheduled.favourite,
					current_holding: 0,
					closing_balance: 0,
					unused: true
				}
			]
		end

		before do
			# Set the price to $2 as at today
			security_with_prices.update_price! 2, Time.zone.today, nil
		end

		it 'should return the list of securities and their balances' do
			expect(security.list).to eq json
		end
	end

	describe '#price' do
		subject(:security) { create :security }

		before do
			# Prices before the target date
			(1..5).each { |i| security.update_price! i,  as_at - i, nil } if defined? earlier_prices

			# Prices after the target date
			(1..5).each { |i| security.update_price! i,  as_at + i, nil }
		end

		context 'when a date is passed' do
			let(:as_at) { Date.parse '2014-01-01' }

			context 'and prices exist before or on that date' do
				let(:earlier_prices) { true }

				it 'should return the latest price as at the passed date' do
					expect(security.price as_at).to eq 1
				end
			end

			context 'and prices do not exist before or on that date' do
				it 'should return zero' do
					expect(security.price as_at).to eq 0
				end
			end
		end

		context 'when a date is not passed' do
			let(:as_at) { Time.zone.today }

			context 'and prices exist before or on the current date' do
				let(:earlier_prices) { true }

				it 'should return the latest price as at the current date' do
					expect(security.price).to eq 1
				end
			end

			context 'and prices do not exist before or on the current date' do
				it 'should return zero' do
					expect(security.price).to eq 0
				end
			end
		end
	end

	describe '#update_price!' do
		subject(:security) { create :security }

		let(:price) { 100 }
		let(:as_at) { Date.parse '2014-01-01' }

		before do
			security.update_price! price, as_at, nil
		end

		context 'when a price already exists for the date' do
			let(:new_price) { 200 }
			let!(:first_transaction) { create :security_holding_transaction, security: security, transaction_date: as_at }
			let!(:second_transaction) { create :security_holding_transaction, security: security, transaction_date: as_at }

			context "and this transaction represents the 'most recent' price" do
				it 'should update the existing price' do
					security.update_price! new_price, as_at, second_transaction.id
					expect(security.price as_at).to eq new_price
				end
			end

			context "and this transaction does not represent the 'most recent' price" do
				it 'should not update the existing price' do
					security.update_price! new_price, as_at, first_transaction.id
					expect(security.price as_at).to eq price
				end
			end
		end

		context "when a price doesn't exist for the date" do
			it 'should create a new price' do
				expect(security.price as_at).to eq price
			end
		end
	end

	describe '#opening_balance' do
		subject(:security) { create :security }

		it 'should return zero' do
			expect(security.opening_balance).to eq 0
		end
	end

	describe '#account_type' do
		subject(:security) { create :security }

		it "should return 'investment'" do
			expect(security.account_type).to eq 'investment'
		end
	end

	describe '#related_account' do
		subject(:security) { create :security }

		it 'should return nil' do
			expect(security.related_account).to be_nil
		end
	end

	describe '#as_json' do
		subject(:security) { create :security, name: 'Test Security', code: 'TEST', transactions: 1 }

		let(:json) { security.as_json }

		it 'should return a JSON representation' do
			expect(json).to include id: security.id
			expect(json).to include name: 'Test Security'
			expect(json).to include code: 'TEST'
			expect(json).to include current_holding: 10
			expect(json).to include closing_balance: security.closing_balance
			expect(json).to include num_transactions: 1
			expect(json).to include unused: false
			expect(json).to include favourite: false
		end
	end
end
