# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TransactionHeader, type: :model do
	describe '#validate_transaction_date_or_schedule_presence' do
		subject(:transaction_header) { described_class.new }

		let(:error_message) { "Either transaction date or schedule can't be blank" }

		it 'should be an error if both transaction date and schedule are blank' do
			transaction_header.validate_transaction_date_or_schedule_presence
			expect(transaction_header.errors[:base]).to include error_message
		end

		it 'should not be an error if transaction date is not blank' do
			transaction_header.transaction_date = Time.zone.today
			transaction_header.validate_transaction_date_or_schedule_presence
			expect(transaction_header.errors[:base]).not_to include error_message
		end

		it 'should not be an error if schedule is not blank' do
			transaction_header.schedule = build :schedule
			transaction_header.validate_transaction_date_or_schedule_presence
			expect(transaction_header.errors[:base]).not_to include error_message
		end

		it 'should not be an error if both transaction date and schedule are not blank' do
			transaction_header.transaction_date = Time.zone.today
			transaction_header.schedule = build :schedule
			transaction_header.validate_transaction_date_or_schedule_presence
			expect(transaction_header.errors[:base]).not_to include error_message
		end
	end

	describe '#validate_transaction_date_or_schedule_absence' do
		subject(:transaction_header) { described_class.new }

		let(:error_message) { 'Either transaction date or schedule must be blank' }

		it 'should be an error if both transaction date and schedule are not blank' do
			transaction_header.transaction_date = Time.zone.today
			transaction_header.schedule = build :schedule
			transaction_header.validate_transaction_date_or_schedule_absence
			expect(transaction_header.errors[:base]).to include error_message
		end

		it 'should not be an error if transaction date is blank' do
			transaction_header.schedule = build :schedule
			transaction_header.validate_transaction_date_or_schedule_absence
			expect(transaction_header.errors[:base]).not_to include error_message
		end

		it 'should not be an error if schedule is blank' do
			transaction_header.transaction_date = Time.zone.today
			transaction_header.validate_transaction_date_or_schedule_absence
			expect(transaction_header.errors[:base]).not_to include error_message
		end

		it 'should not be an error if both transaction date and schedule are blank' do
			transaction_header.validate_transaction_date_or_schedule_absence
			expect(transaction_header.errors[:base]).not_to include error_message
		end
	end

	matcher :match_json do |expected|
		match do |actual|
			actual.transaction_date.eql? expected['transaction_date']
		end
	end

	describe '#update_from_json' do
		let(:header) { create :transaction_header }
		let(:json) do
			{
				'next_due_date' => Time.zone.today,
				'frequency' => 'Weekly',
				'estimate' => true,
				'auto_enter' => true
			}
		end

		after do
			expect(header.update_from_json json).to match_json json
		end

		context 'unscheduled' do
			before do
				json['transaction_date'] = Time.zone.today
			end

			it('should update a transaction header from a JSON representation') {}

			context 'when previously scheduled' do
				let(:header) { create :transaction_header, :scheduled }

				it 'should destroy the previous schedule' do
					expect(header.schedule).to receive :destroy!
				end
			end
		end

		context 'scheduled' do
			let(:schedule) { header.schedule || create(:schedule) }

			after do
				expect(schedule).to receive(:assign_attributes).with next_due_date: json['next_due_date'], frequency: json['frequency'], estimate: json['estimate'].eql?(true), auto_enter: json['auto_enter'].eql?(true)
			end

			it 'should update a transaction header from a JSON representation' do
				expect(header).to receive(:build_schedule).and_return schedule
			end

			context 'when previously scheduled' do
				let(:header) { create :transaction_header, :scheduled }

				it 'should update the existing schedule' do
					expect(header).not_to receive :build_schedule
				end
			end
		end
	end

	describe '#as_json' do
		let(:json) { transaction_header.as_json }

		after do
			expect(json).to include transaction_date: transaction_header.transaction_date
		end

		context 'unscheduled' do
			subject(:transaction_header) { create :transaction_header }

			it('should return a JSON representation') {}
		end

		context 'scheduled' do
			subject(:transaction_header) { create :transaction_header, :scheduled }

			before do
				expect(transaction_header.schedule).to receive(:as_json).and_return schedule: 'schedule json'
			end

			it 'should return a JSON representation' do
				expect(json).to include schedule: 'schedule json'
			end
		end
	end
end
