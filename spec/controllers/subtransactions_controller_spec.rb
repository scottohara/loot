# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::SubtransactionsController, type: :controller do
	describe 'GET index', request: true, json: true do
		let(:split_transaction) { ::SplitTransaction.new }
		let(:json) { 'split transaction children' }

		it 'should return the child transactions of a split transaction' do
			expect(::SplitTransaction).to receive(:find).with('1').and_return split_transaction
			expect(split_transaction).to receive(:children).and_return json
			get :index, params: {transaction_id: '1'}
		end
	end
end
