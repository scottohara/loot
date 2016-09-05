# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true
require 'models/concerns/categorisable'

RSpec.shared_examples Transactable do
	it_behaves_like Categorisable

	describe '#ledger' do
		# Custom matcher that compares a set of transactions against another set
		matcher :match_ledger_transactions do |expected|
			match do |actual|
				@diffs = []

				# Make sure the array lengths match
				return false unless expected.distinct { |t| t[:id] }.size.eql? actual.uniq { |t| t[:id] }.size

				# Check each expected transaction against it's actual counterpart(s)
				expected.any? do |trx|
					# Find the matching actual transaction(s)
					# (could be multiple for the same id, eg. both sides of a transfer for a payee/security)
					actual_trxes = actual.select { |t| t[:id].eql? trx[:id] }
					diffs = []

					# If none of the actual transactions match, add the mismatch
					@diffs += diffs if actual_trxes.none? do |actual_trx|
						# Convert the expected transaction to JSON and compact
						expected_json = compact trx.as_subclass.as_json(direction: actual_trx[:direction], primary_account: actual_trx[:primary_account][:id])

						# Compact (a copy of) the actual transaction
						actual_json = compact actual_trx.deep_dup

						diffs << {
							id: trx.id,
							type: trx.transaction_type,
							expected: expected_json.delete_if { |key, value| actual_json[key].eql? value },
							actual: actual_json.slice(*expected_json.keys)
						} unless expected_json.hash.eql? actual_json.hash

						expected_json.hash.eql? actual_json.hash
					end

					@diffs.empty?
				end
			end

			failure_message do
				if @diffs.empty?
					# Size mismatch
					"expected #{expected.distinct { |t| t[:id] }.size} #{'transaction'.pluralize} but got #{actual.uniq { |t| t[:id] }.size}"
				else
					# Content mismatch
					@diffs.reduce('') do |message, diff|
						message += "Transaction #:\t#{diff[:id]} (#{diff[:type]})\n"
						message += "Expected:\t#{diff[:expected]}\n"
						message + "Actual:\t\t#{diff[:actual]}\n\n"
					end
				end
			end

			def compact(transaction)
				expected_keys = %i(id transaction_type transaction_date parent_id amount quantity commission price direction status related_status memo flag)
				nested_keys = {
					primary_account: %i(id name account_type),
					payee: %i(id name),
					security: %i(id name),
					category: %i(id name),
					subcategory: %i(id name),
					account: %i(id name)
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

		# Custom matcher that checks if a set of transactions are all for a particular context
		matcher :all_belong_to do |subject, key|
			match do |transactions|
				transactions.all? do |transaction|
					if key.eql? :memo
						# For transaction search, check that the memo contains the search term ("transaction")
						transaction[:memo].downcase.include? 'transaction'
					else
						# For anything else, compare the :id of the keys
						transaction[key][:id].to_s.eql? subject.id.to_s
					end
				end
			end
		end

		it 'should handle all types of transactions and ignore scheduled transactions' do
			context = create context_factory, :with_all_transaction_types, scheduled: 1
			subject = defined?(as_class_method) && described_class || context

			_, transactions = subject.ledger query: 'Transaction'
			expected_transactions = subject.transactions.for_ledger(query: 'Transaction').where 'transaction_headers.transaction_date IS NOT NULL'

			expect(transactions).to match_ledger_transactions expected_transactions
		end

		it 'should only include transactions belonging to the context' do
			context = create context_factory, transactions: 2
			if defined? as_class_method
				# Another transaction with a memo that doesn't contain the search term ("transaction")
				create :basic_transaction, memo: 'Other context'
			else
				# Another context with transactions
				create context_factory, transactions: 2
			end
			subject = defined?(as_class_method) && described_class || context

			_, transactions = subject.ledger(query: 'Transaction')

			expect(transactions.uniq { |t| t[:id] }.size).to eq 2
			expect(transactions).to all_belong_to context, ledger_json_key
		end

		context 'when fetching backwards', spec_type: :range do
			let(:direction) { :prev }

			context 'when the date is near the start of the range' do
				let(:range) { 0..4 }
				let(:expected_at_end) { true }

				it('should return the earliest set of transactions') {}
			end

			context 'when the date is not near the start of the range' do
				let(:range) { 2..9 }
				let(:expected_at_end) { false }

				it('should return an earlier set of transactions') {}
			end

			after :each do
				@as_at = range.last + 1
			end
		end

		context 'when fetching forwards', spec_type: :range do
			let(:direction) { :next }

			context 'when the date is not near the end of the range' do
				let(:range) { 2..10 }
				let(:expected_at_end) { false }

				it('should return a later set of transactions') {}
			end

			context 'when the date is near the end of the range' do
				let(:range) { 10..14 }
				let(:expected_at_end) { true }

				it('should return the last set of transactions') {}
			end

			after :each do
				@as_at = range.first - 1
			end
		end

		after :each, spec_type: :range do
			FactoryGirl.reload

			# Create the context with 15 basic transactions
			context = create context_factory, transactions: 15
			subject = defined?(as_class_method) && described_class || context

			# Change the size of the result set
			stub_const 'Transactable::NUM_RESULTS', 9

			# Get the ledger
			_, transactions, at_end = subject.ledger as_at: (Date.parse('2014-01-01') + @as_at).to_s, direction: direction, query: 'Transaction'

			expect(transactions.uniq { |t| t[:id] }.size).to eq range.size
			expect(transactions.first[:transaction_date]).to eq(Date.parse('2014-01-01') + range.first)
			expect(transactions.last[:transaction_date]).to eq(Date.parse('2014-01-01') + range.last)
			expect(at_end).to be expected_at_end
		end
	end

	describe '#closing_balance' do
		let(:context) { create context_factory, :with_all_transaction_types, scheduled: 1 }
		subject { defined?(as_class_method) && described_class || context }

		before :each do
			FactoryGirl.reload

			if defined? as_class_method
				context # Needs reference here because context is lazy-loaded (otherwise transactions are never created)
			end
		end

		it 'should return the closing balance as the passed date' do
			expect(subject.closing_balance(as_at: '2014-01-01', query: 'Transaction')).to eq expected_closing_balances[:with_date]
		end

		context 'when a date is not passed' do
			it 'should return the closing balance as at today' do
				expect(subject.closing_balance(query: 'Transaction')).to eq expected_closing_balances[:without_date]
			end
		end
	end

	describe '#ledger_options' do
		subject { defined?(as_class_method) && described_class || described_class.new }

		it 'should set default values for missing options' do
			opts = subject.ledger_options

			expect(opts[:as_at]).to eq '2400-12-31'
			expect(opts[:direction]).to eq :prev
			expect(opts[:unreconciled]).to be false
		end

		it 'should set default values for invalid options' do
			opts = subject.ledger_options(
				as_at: 'invalid',
				direction: 'invalid',
				unreconciled: 'invalid'
			)

			expect(opts[:as_at]).to eq '2400-12-31'
			expect(opts[:direction]).to eq :prev
			expect(opts[:unreconciled]).to be false
		end

		it 'should retain any valid options provided' do
			opts = subject.ledger_options(
				as_at: '2014-01-01',
				direction: 'next',
				unreconciled: 'true'
			)

			expect(opts[:as_at]).to eq '2014-01-01'
			expect(opts[:direction]).to eq :next
			expect(opts[:unreconciled]).to be true
		end
	end

	describe '#drop_opening_date' do
		subject { defined?(as_class_method) && described_class || described_class.new }

		let(:transactions) do
			[
				{'transaction_date' => '2014-01-02'},
				{'transaction_date' => '2014-01-01'},
				{'transaction_date' => '2014-01-01'}
			]
		end

		context 'when at end' do
			it 'should return the transactions in reverse order' do
				processed_transactions = subject.drop_opening_date transactions, true, nil

				expect(processed_transactions.size).to eq 3
				expect(processed_transactions.first['transaction_date']).to eq '2014-01-01'
				expect(processed_transactions.last['transaction_date']).to eq '2014-01-02'
			end
		end

		context 'when not at end' do
			it 'should remove any transactions for the opening date and return the rest in reverse order' do
				processed_transactions = subject.drop_opening_date transactions, false, '2014-01-01'

				expect(processed_transactions.size).to eq 1
				expect(processed_transactions).to include('transaction_date' => '2014-01-02')
			end
		end
	end

	describe '#ledger_opening_balance' do
		subject { defined?(as_class_method) && described_class || described_class.new }

		context 'when fetching backwards' do
			let(:opts) { {direction: :prev} }

			context 'when at end' do
				it "should return the context's opening balance" do
					expect(subject).to receive :opening_balance

					subject.ledger_opening_balance opts, true, nil
				end
			end

			context 'when not at end' do
				it "should return the context's closing balance at the closing date" do
					expect(subject).to receive(:closing_balance) { '2014-01-01' }

					subject.ledger_opening_balance opts, false, '2014-01-01'
				end
			end
		end

		context 'when fetching forwards' do
			let(:opts) { {direction: :next, as_at: '2014-01-02'} }

			it "should return the context's closing balance at the passed date" do
				expect(subject).to receive(:closing_balance) { '2014-01-02' }

				subject.ledger_opening_balance opts, nil, nil
			end
		end
	end

	describe '#exclude_reconciled' do
		subject { defined?(as_class_method) && described_class || described_class.new }

		before :each do
			@opening_balance, @transactions = subject.exclude_reconciled 100, [
				{'status' => 'Reconciled', 'amount' => 10, 'direction' => 'inflow'}, # +$10 inflow
				{'status' => 'Reconciled', 'amount' => 5, 'direction' => 'outflow'}, # -$5	outflow
				{'status' => 'Reconciled', 'amount' => nil, 'direction' => 'inflow'}, # ignore, amount is nil
				{'status' => nil, 'amount' => 10, 'direction' => 'inflow'} # ignore, unreconciled
			]
		end

		it 'should update the opening balance with the amounts of any reconciled transactions' do
			expect(@opening_balance).to eq 105
		end

		it 'should remove any reconciled transactions' do
			expect(@transactions.size).to eq 1
			expect(@transactions.first).to include('status' => nil, 'amount' => 10, 'direction' => 'inflow')
		end
	end
end
