# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::StatusesController do
	let(:transaction) { create :basic_transaction, status: 'Cleared' }
	let(:transaction_account) { transaction.transaction_account }

	describe 'PATCH update', :request do
		context 'when the status is valid' do
			let(:expected_status) { :no_content }

			before do
				patch :update, params: {account_id: transaction_account.account_id, transaction_id: transaction.id, "#{status}": true}
			end

			after do
				expect(transaction_account.reload.status).to eq status
			end

			context 'Cleared' do
				let(:status) { 'Cleared' }

				it('should update the status') {} # Empty block
			end

			context 'Reconciled' do
				let(:status) { 'Reconciled' }

				it('should update the status') {} # Empty block
			end
		end

		context 'when the status is invalid' do
			let(:expected_status) { :bad_request }

			it 'should not update anything' do
				expect(::TransactionAccount).not_to receive :find_by!
				patch :update, params: {account_id: transaction_account.account_id, transaction_id: transaction.id, invalid: true}
				expect(transaction_account.reload.status).to eq 'Cleared'
			end
		end

		context "when the transaction doesn't belong to the account", :json do
			let(:expected_status) { :not_found }
			let(:json) { 'transaction not found' }

			it 'should not update anything' do
				expect(::TransactionAccount).to receive(:find_by!).with(account_id: (transaction_account.account_id + 1).to_s, transaction_id: transaction.id.to_s).and_raise ::ActiveRecord::RecordNotFound, json
				patch :update, params: {account_id: transaction_account.account_id + 1, transaction_id: transaction.id, Reconciled: true}
				expect(transaction_account.reload.status).to eq 'Cleared'
			end
		end
	end

	describe 'DELETE destroy', :request do
		context 'when the transaction belongs to the account' do
			let(:expected_status) { :no_content }

			it 'should clear the existing status' do
				delete :destroy, params: {account_id: transaction_account.account_id, transaction_id: transaction.id}
				expect(transaction_account.reload.status).to be_nil
			end
		end

		context "when the transaction doesn't belong to the account", :json do
			let(:expected_status) { :not_found }
			let(:json) { 'transaction not found' }

			it 'should not update anything' do
				expect(::TransactionAccount).to receive(:find_by!).with(account_id: (transaction_account.account_id + 1).to_s, transaction_id: transaction.id.to_s).and_raise ::ActiveRecord::RecordNotFound, json
				delete :destroy, params: {account_id: transaction_account.account_id + 1, transaction_id: transaction.id}
				expect(transaction_account.reload.status).to eq 'Cleared'
			end
		end
	end
end
