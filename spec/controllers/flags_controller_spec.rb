# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::FlagsController, type: :controller do
	describe 'PATCH update', request: true do
		let(:flag_type) { 'noreceipt' }
		let(:memo) { 'Test flag' }

		before do
			expect(::Transaction).to receive(:find).with('1').and_return transaction
		end

		after do
			patch :update, params: {transaction_id: '1', flag_type: flag_type, memo: memo}
		end

		context "when a flag doesn't already exist" do
			let(:transaction) { create :transaction }

			it 'should create a new flag' do
				expect(transaction).to receive(:build_flag).with flag_type: flag_type, memo: memo
				expect(transaction).to receive :save!
			end
		end

		context 'when a flag already exists' do
			let(:transaction) { create :transaction, :flagged }

			it 'should update the existing flag' do
				expect(transaction).not_to receive :build_flag
				expect(transaction).not_to receive :save!
				expect(transaction.flag).to receive(:update!).with flag_type: flag_type, memo: memo
			end
		end
	end

	describe 'DELETE destroy', request: true do
		let(:transaction) { create :transaction, :flagged }

		it 'should delete an existing flag' do
			expect(::Transaction).to receive(:find).with('1').and_return transaction
			expect(transaction.flag).to receive :destroy!
			delete :destroy, params: {transaction_id: '1'}
		end
	end
end
