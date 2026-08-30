# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::RSpec.shared_examples ::Transferable do
	describe '::create_from_json' do
		before do
			expect(::Account).to receive(:find).with(create_json['primary_account']['id']).and_return primary_account
			expect(::Account).to receive(:find).with(create_json['account']['id']).and_return account
			expect_any_instance_of(header.class).to receive(:update_from_json).with(create_json).and_call_original
		end

		after do
			expect(described_class.create_from_json create_json).to match_json create_json, primary_account, account, header
		end

		context 'outflow' do
			it 'should create a transaction from a JSON representation' do
				create_json['direction'] = 'outflow'
			end
		end

		context 'inflow' do
			it 'should create a transaction from a JSON representation' do
				create_json['direction'] = 'inflow'
			end
		end
	end

	describe '::update_from_json' do
		let(:transaction) { create factory }
		let(:relation) { instance_double ::ActiveRecord::Relation }

		before do
			expect(described_class).to receive(:includes).with(:header, :source_account, :destination_account).and_return relation
			expect(relation).to receive(:find).with(update_json[:id]).and_return transaction
			expect(::Account).to receive(:find).with(update_json['primary_account']['id']).and_return primary_account
			expect(::Account).to receive(:find).with(update_json['account']['id']).and_return account
			expect(transaction.header).to receive(:update_from_json).with update_json
		end

		after do
			expect(described_class.update_from_json update_json).to match_json update_json, primary_account, account, transaction.header
		end

		context 'outflow' do
			it 'should update a transaction from a JSON representation' do
				update_json['direction'] = 'outflow'
			end
		end

		context 'inflow' do
			it 'should update a transaction from a JSON representation' do
				update_json['direction'] = 'inflow'
			end
		end
	end

	describe '#validate_account_uniqueness' do
		subject(:transaction) { described_class.new }

		let(:source_account) { create :account }
		let(:error_message) { "Source and destination account can't be the same" }

		context 'when both accounts are present' do
			before do
				transaction.build_source_transaction_account(direction: 'outflow').account = source_account
				transaction.build_destination_transaction_account(direction: 'inflow').account = destination_account
				transaction.validate_account_uniqueness
			end

			context 'when the source and destination accounts are the same' do
				let(:destination_account) { source_account }

				it 'should be an error' do
					expect(transaction.errors[:base]).to include error_message
				end
			end

			context 'when the source and destination accounts are not the same' do
				let(:destination_account) { create :account }

				it 'should not be an error' do
					expect(transaction.errors[:base]).not_to include error_message
				end
			end
		end

		context 'when only the source account is present' do
			before do
				transaction.build_source_transaction_account(direction: 'outflow').account = source_account
			end

			it 'should not be an error' do
				expect { transaction.validate_account_uniqueness }.not_to raise_error
			end
		end

		context 'when only the destination account is present' do
			let(:destination_account) { create :account }

			before do
				transaction.build_destination_transaction_account(direction: 'inflow').account = destination_account
			end

			it 'should not be an error' do
				expect { transaction.validate_account_uniqueness }.not_to raise_error
			end
		end
	end

	describe '#as_json' do
		subject(:transaction) { create factory, status: 'Reconciled' }

		before do
			expect(transaction.source_account).to receive(:as_json).and_return 'source account json'
			expect(transaction.destination_account).to receive(:as_json).and_return 'destination account json'
		end

		context 'outflow' do
			let(:json) { transaction.as_json direction: 'outflow' }

			it 'should return a JSON representation' do
				expect(json).to include primary_account: 'source account json'
				expect(json).to include category: {id: 'TransferTo', name: 'Transfer To'}
				expect(json).to include account: 'destination account json'
				expect(json).to include direction: 'outflow'
				expect(json).to include status: 'Reconciled'
				expect(json).to include related_status: nil
			end
		end

		context 'inflow' do
			let(:json) { transaction.as_json direction: 'inflow' }

			it 'should return a JSON representation' do
				expect(json).to include primary_account: 'destination account json'
				expect(json).to include category: {id: 'TransferFrom', name: 'Transfer From'}
				expect(json).to include account: 'source account json'
				expect(json).to include direction: 'inflow'
				expect(json).to include status: nil
				expect(json).to include related_status: 'Reconciled'
			end
		end
	end
end
