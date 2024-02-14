# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::TransactionsController do
	describe 'GET index', :json, :request do
		let(:opening_balance) { 1 }
		let(:transactions) { 'transactions' }
		let(:at_end) { false }
		let(:json) do
			::JSON.dump(
				openingBalance: opening_balance.to_f,
				transactions:,
				atEnd: at_end
			)
		end

		before :each, :instance do
			expect(context.class).to receive(:find).with('1').and_return context
		end

		after do
			request_params.merge!('controller' => 'transactions', 'action' => 'index')
			expect(controller).to receive(:context).and_call_original
			expect(context).to receive(:ledger).with(::ActionController::Parameters.new request_params).and_return [opening_balance, transactions, at_end]
			get :index, params: request_params
		end

		context 'for account', :instance do
			let(:context) { ::Account.new }
			let(:request_params) { {'account_id' => '1'} }

			it('should return the transaction ledger for the account') {} # Empty block
		end

		context 'for payee', :instance do
			let(:context) { ::Payee.new }
			let(:request_params) { {'payee_id' => '1'} }

			it('should return the transaction ledger for the payee') {} # Empty block
		end

		context 'for category', :instance do
			let(:context) { ::Category.new }
			let(:request_params) { {'category_id' => '1'} }

			it('should return the transaction ledger for the category') {} # Empty block
		end

		context 'for security', :instance do
			let(:context) { ::Security.new }
			let(:request_params) { {'security_id' => '1'} }

			it('should return the transaction ledger for the security') {} # Empty block
		end

		context 'for search' do
			let(:context) { ::Transaction }
			let(:request_params) { {'query' => 'Transactions'} }

			it('should return the transaction ledger for the search query') {} # Empty block
		end
	end

	describe 'GET show', :json, :request do
		let(:transaction) { ::Transaction.new }
		let(:json) { 'transaction details' }

		it 'should return the details of the specified transaction' do
			expect(::Transaction).to receive(:find).with('1').and_return transaction
			expect(transaction).to receive(:as_subclass).and_return json
			get :show, params: {id: '1'}
		end
	end

	describe 'POST create', :json, :request do
		let(:json) { 'created transaction' }

		it 'should create a new transaction of the specified type and return the details' do
			expect(controller).to receive(:clean).and_call_original
			expect(controller).to receive(:create_transaction).and_return json
			post :create
		end
	end

	describe 'PATCH update', :json, :request do
		let(:transaction) { create(:basic_transaction) }
		let(:json) { 'updated transaction' }

		before do
			expect(controller).to receive(:clean).and_call_original
			expect(::Transaction).to receive(:find).with('1').and_return transaction
		end

		after do
			patch :update, params: request_body
		end

		context "when transaction type hasn't changed" do
			let(:request_body) { {id: '1', transaction_type: 'Basic', controller: 'transactions', action: 'update'} }

			it 'should update the existing transaction' do
				expect(::BasicTransaction).to receive(:update_from_json).with(::ActionController::Parameters.new request_body).and_return json
			end
		end

		context 'when transaction type has changed' do
			let(:request_body) { {id: '1', transaction_type: 'Transfer'} }

			it 'should destroy and recreate the transaction' do
				expect(transaction).to receive(:as_subclass).and_return transaction
				expect(transaction).to receive :destroy!
				expect(controller).to receive(:create_transaction).and_return json
			end
		end
	end

	describe 'DELETE destroy', :request do
		let(:transaction) { create(:basic_transaction) }

		it 'should delete an existing transaction' do
			expect(::Transaction).to receive(:find).with('1').and_return transaction
			expect(transaction).to receive(:as_subclass).and_return transaction
			expect(transaction).to receive :destroy!
			delete :destroy, params: {id: '1'}
		end
	end

	describe 'GET last', :json, :request do
		let(:account_type) { 'account type' }
		let(:transaction_types) { 'transaction types' }

		before :each, :instance do
			expect(context.class).to receive(:find).with('1').and_return context
		end

		context 'when there are transactions' do
			let(:last_transaction) { create(:basic_transaction) }
			let(:transactions) do
				[
					create(:transaction),
					create(:transaction),
					last_transaction
				]
			end
			let(:json) { ::JSON.dump last_transaction.as_json }

			after do
				expect(controller).to receive(:context).and_call_original
				expect(::Transaction).to receive(:types_for).with(account_type).and_return transaction_types
				expect(context.transactions).to receive(:where).with(transaction_type: transaction_types).and_return transactions
				expect(last_transaction).to receive(:as_subclass).and_return last_transaction
				get :last, params: request_params.merge(account_type:)
			end

			context 'for account', :instance do
				let(:context) { ::Account.new }
				let(:request_params) { {'account_id' => '1'} }

				it('should return the last transaction for the account') {} # Empty block
			end

			context 'for payee', :instance do
				let(:context) { ::Payee.new }
				let(:request_params) { {'payee_id' => '1'} }

				it('should return the last transaction for the payee') {} # Empty block
			end

			context 'for category', :instance do
				let(:context) { ::Category.new }
				let(:request_params) { {'category_id' => '1'} }

				it('should return the last transaction for the category') {} # Empty block
			end

			context 'for security', :instance do
				let(:context) { ::Security.new }
				let(:request_params) { {'security_id' => '1'} }

				it('should return the last transaction for the security') {} # Empty block
			end
		end

		context 'when there are no transactions' do
			let(:expected_status) { :not_found }
			let(:last_transaction) { nil }
			let(:transactions) { [] }
			let(:json) { '' }

			after do
				expect(controller).to receive(:context).and_call_original
				expect(::Transaction).to receive(:types_for).with(account_type).and_return transaction_types
				expect(context.transactions).to receive(:where).with(transaction_type: transaction_types).and_return transactions
				get :last, params: request_params.merge(account_type:)
			end

			context 'for account', :instance do
				let(:context) { ::Account.new }
				let(:request_params) { {'account_id' => '1'} }

				it('should respond with a 404 Not Found') {} # Empty block
			end

			context 'for payee', :instance do
				let(:context) { ::Payee.new }
				let(:request_params) { {'payee_id' => '1'} }

				it('should respond with a 404 Not Found') {} # Empty block
			end

			context 'for category', :instance do
				let(:context) { ::Category.new }
				let(:request_params) { {'category_id' => '1'} }

				it('should respond with a 404 Not Found') {} # Empty block
			end

			context 'for security', :instance do
				let(:context) { ::Security.new }
				let(:request_params) { {'security_id' => '1'} }

				it('should respond with a 404 Not Found') {} # Empty block
			end
		end
	end

	describe '#clean' do
		it 'should remove any empty or nil values from the passed parameters' do
			controller.params = ::ActionController::Parameters.new(
				a: 'a',
				b: '',
				c: nil
			)

			controller.clean

			expect(assigns(:transaction).to_unsafe_h).to eq 'a' => 'a'
		end
	end

	describe '#create_transaction' do
		it 'should create a transaction from the JSON in the request body' do
			controller.params = ::ActionController::Parameters.new 'transaction_type' => 'Basic'
			expect(::BasicTransaction).to receive(:create_from_json).with controller.params

			controller.clean
			controller.create_transaction
		end
	end
end
