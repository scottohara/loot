# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'models/concerns/categorisable'
require 'models/concerns/measurable'

RSpec.describe Schedule, type: :model do
	it_behaves_like Categorisable
	it_behaves_like Measurable

	# Custom matcher that compares a set of transactions against another set
	matcher :match_ledger_transactions do |expected|
		diffs = []

		match do |actual|
			# Make sure the array lengths match
			return false unless expected.uniq(&:id).size.eql? actual.uniq { |t| t[:id] }.size

			# Check each expected transaction against it's actual counterpart
			expected.all? do |trx|
				# Find the matching actual transaction
				actual_trx = actual.find { |t| t[:id].eql? trx.id }

				# Convert the expected transaction to JSON and compact
				expected_json = compact trx.as_subclass.as_json direction: actual_trx[:direction], primary_account: actual_trx[:primary_account][:id]

				# Compact the actual transaction
				actual_json = compact actual_trx

				# Skip if matches
				return true if expected_json.hash.eql? actual_json.hash

				# Track the differences
				diffs << {
					id: trx.id,
					type: trx.transaction_type,
					expected: expected_json.delete_if { |key, value| actual_json[key].eql? value },
					actual: actual_json.slice(*expected_json.keys)
				}

				# If we get here, we have a mismatch
				false
			end
		end

		failure_message do
			if diffs.empty?
				# Size mismatch
				"expected #{expected.uniq(&:id).size} #{'transaction'.pluralize} but got #{actual.uniq(&:id).size}"
			else
				# Content mismatch
				diffs.reduce('') do |message, diff|
					message += "Transaction #:\t#{diff[:id]} (#{diff[:type]})\n"
					message += "Expected:\t#{diff[:expected]}\n"
					message + "Actual:\t\t#{diff[:actual]}\n\n"
				end
			end
		end

		def compact(transaction)
			expected_keys = %i[id transaction_type next_due_date frequency estimate auto_enter amount quantity commission price direction memo flag overdue_count]
			nested_keys = {
				primary_account: %i[id name account_type],
				payee: %i[id name],
				security: %i[id name],
				category: %i[id name],
				subcategory: %i[id name],
				account: %i[id name]
			}

			# Remove any keys that we don't care about
			transaction = transaction.extract!(*expected_keys, *nested_keys.keys)

			# ..and the same for any nested keys
			nested_keys.each do |nested_key, keys|
				next if transaction[nested_key].nil?

				transaction[nested_key] = transaction[nested_key].extract!(*keys)
				transaction[nested_key].compact!
				transaction[nested_key] = nil if transaction[nested_key].empty?
			end

			# Category/subcategory IDs need to be strings
			transaction[:category][:id] = transaction[:category][:id].to_s if transaction[:category]
			transaction[:subcategory][:id] = transaction[:subcategory][:id].to_s if transaction[:subcategory]

			# Remove any nil values
			transaction.compact
		end
	end

	describe '::ledger' do
		let!(:scheduled_transactions) do
			[
				create(:basic_expense_transaction, :scheduled, :flagged),
				create(:basic_income_transaction, :scheduled),
				create(:transfer_transaction, :scheduled),
				create(:split_to_transaction, :scheduled, subtransactions: 1, subtransfers: 1),
				create(:split_from_transaction, :scheduled, subtransactions: 1, subtransfers: 1),
				create(:payslip_transaction, :scheduled, subtransactions: 1, subtransfers: 1),
				create(:loan_repayment_transaction, :scheduled, subtransactions: 1, subtransfers: 1),
				create(:security_purchase_transaction, :scheduled),
				create(:security_sale_transaction, :scheduled),
				create(:security_add_transaction, :scheduled),
				create(:security_remove_transaction, :scheduled),
				create(:security_transfer_transaction, :scheduled),
				create(:dividend_transaction, :scheduled)
			]
		end

		it 'should handle all types of scheduled transactions and ignore non-scheduled ones' do
			# Non-scheduled transaction (should be ignored)
			create :basic_transaction

			transactions = described_class.ledger

			expect(transactions).to match_ledger_transactions scheduled_transactions
		end
	end

	describe '::auto_enter_overdue' do
		# Custom matcher that checks if a transaction was created from json
		matcher :be_created_from do |json, account_id, next_due_date|
			match do |transaction_class|
				# JSON passed is the schedule, so we need to update it to be a transaction instance
				json[:id] = nil
				json[:transaction_date] = next_due_date
				json[:account_id] = account_id

				# Remove scheduled related properties
				json.delete :next_due_date
				json.delete :frequency
				json.delete :estimate
				json.delete :auto_enter
				json.delete :overdue_count

				expect(transaction_class).to receive(:create_from_json).with json.deep_stringify_keys
			end
		end

		it 'should handle all types of overdue, auto-enter scheduled transactions' do
			basic_transaction = create :basic_transaction, :scheduled
			transfer_transaction = create :transfer_transaction, :scheduled
			security_investment_transaction = create :security_investment_transaction, :scheduled
			security_transfer_transaction = create :security_transfer_transaction, :scheduled
			dividend_transaction = create :dividend_transaction, :scheduled

			expect(BasicTransaction).to be_created_from basic_transaction.as_json, basic_transaction.account.id, basic_transaction.header.schedule.next_due_date
			expect(TransferTransaction).to be_created_from transfer_transaction.as_subclass.as_json(direction: 'outflow'), transfer_transaction.source_account.id, transfer_transaction.header.schedule.next_due_date
			expect(SecurityInvestmentTransaction).to be_created_from security_investment_transaction.as_subclass.as_json, security_investment_transaction.investment_account.id, security_investment_transaction.header.schedule.next_due_date
			expect(SecurityTransferTransaction).to be_created_from security_transfer_transaction.as_subclass.as_json(direction: 'outflow'), security_transfer_transaction.source_account.id, security_transfer_transaction.header.schedule.next_due_date
			expect(DividendTransaction).to be_created_from dividend_transaction.as_subclass.as_json, dividend_transaction.investment_account.id, dividend_transaction.header.schedule.next_due_date

			described_class.auto_enter_overdue
		end

		it 'should ignore non-scheduled, non-overdue or non-auto-enter transactions' do
			create :basic_transaction # Non-scheduled
			create :basic_transaction, :scheduled, next_due_date: Time.zone.tomorrow # Non-overdue
			create :basic_transaction, :scheduled, auto_enter: false # Non-auto-enter

			expect(BasicTransaction).not_to receive :create_from_json

			described_class.auto_enter_overdue
		end

		it 'should handle all types of frequencies and set the next due date to a future date' do
			def months_ago(months)
				# Date.advance(months: -x) will round down (ie. to an earlier date) if the date is invalid (eg. 30-Feb)
				# To ensure that we only have one overdue transaction, make sure that advancing back yields the original date
				target_date = Time.zone.tomorrow.advance months: -months
				target_date = target_date.advance days: 1 until target_date.advance(months: months).future?
				target_date
			end

			def next_due_date(months)
				months_ago(months).advance months: months
			end

			weekly = create :basic_transaction, :scheduled, frequency: 'Weekly', next_due_date: Time.zone.tomorrow.advance(weeks: -1)
			fortnightly = create :basic_transaction, :scheduled, frequency: 'Fortnightly', next_due_date: Time.zone.tomorrow.advance(weeks: -2)
			monthly = create :basic_transaction, :scheduled, frequency: 'Monthly', next_due_date: months_ago(1)
			bimonthly = create :basic_transaction, :scheduled, frequency: 'Bimonthly', next_due_date: months_ago(2)
			quarterly = create :basic_transaction, :scheduled, frequency: 'Quarterly', next_due_date: months_ago(3)
			yearly = create :basic_transaction, :scheduled, frequency: 'Yearly', next_due_date: Time.zone.tomorrow.advance(years: -1)

			expect(BasicTransaction).to be_created_from weekly.as_json, weekly.account.id, weekly.header.schedule.next_due_date
			expect(BasicTransaction).to be_created_from fortnightly.as_json, fortnightly.account.id, fortnightly.header.schedule.next_due_date
			expect(BasicTransaction).to be_created_from monthly.as_json, monthly.account.id, monthly.header.schedule.next_due_date
			expect(BasicTransaction).to be_created_from bimonthly.as_json, bimonthly.account.id, bimonthly.header.schedule.next_due_date
			expect(BasicTransaction).to be_created_from quarterly.as_json, quarterly.account.id, quarterly.header.schedule.next_due_date
			expect(BasicTransaction).to be_created_from yearly.as_json, yearly.account.id, yearly.header.schedule.next_due_date

			described_class.auto_enter_overdue

			expect(described_class.find(fortnightly.header.schedule.id).next_due_date).to eq Time.zone.tomorrow
			expect(described_class.find(monthly.header.schedule.id).next_due_date).to eq next_due_date(1)
			expect(described_class.find(bimonthly.header.schedule.id).next_due_date).to eq next_due_date(2)
			expect(described_class.find(quarterly.header.schedule.id).next_due_date).to eq next_due_date(3)
			expect(described_class.find(yearly.header.schedule.id).next_due_date).to eq Time.zone.tomorrow
		end

		it 'should create as many transactions as are overdue' do
			three_overdue = create :basic_transaction, :scheduled, frequency: 'Fortnightly', next_due_date: Time.zone.tomorrow.advance(weeks: -6)

			expect(BasicTransaction).to be_created_from three_overdue.as_json, three_overdue.account.id, Time.zone.tomorrow.advance(weeks: -6)
			expect(BasicTransaction).to be_created_from three_overdue.as_json, three_overdue.account.id, Time.zone.tomorrow.advance(weeks: -4)
			expect(BasicTransaction).to be_created_from three_overdue.as_json, three_overdue.account.id, Time.zone.tomorrow.advance(weeks: -2)

			described_class.auto_enter_overdue

			expect(described_class.find(three_overdue.header.schedule.id).next_due_date).to eq Time.zone.tomorrow
		end
	end

	describe '#as_json' do
		subject { create :schedule, next_due_date: Time.zone.today.to_s, frequency: 'Yearly', estimate: false, auto_enter: false }

		let(:json) { subject.as_json }

		it 'should return a JSON representation' do
			expect(json).to include next_due_date: Time.zone.today
			expect(json).to include frequency: 'Yearly'
			expect(json).to include estimate: false
			expect(json).to include auto_enter: false
		end
	end
end
