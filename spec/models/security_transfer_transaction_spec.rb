# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'models/concerns/transferable'
require 'rails_helper'

::RSpec.describe ::SecurityTransferTransaction do
	matcher :match_json do |expected, source_account, destination_account, header|
		match do |actual|
			actual[:transaction_type].eql?('SecurityTransfer') &&
				actual[:id].eql?(expected[:id]) &&
				actual[:memo].eql?(expected['memo']) &&
				actual[:primary_account][:id].eql?(source_account.id) &&
				actual[:status].eql?(expected['status']) &&
				actual[:account][:id].eql?(destination_account.id) &&
				actual[:related_status].eql?(expected['related_status']) &&
				actual[:security][:id].eql?(header.security.id) &&
				actual[:transaction_date].eql?(header.transaction_date) &&
				actual[:quantity].eql?(quantity) &&
				actual[:price].nil? &&
				actual[:commission].nil?
		end
	end

	it_behaves_like ::Transferable do
		let(:factory) { :security_transfer_transaction }
		let(:primary_account) { create :investment_account }
		let(:account) { create :investment_account }
		let(:quantity) { 10.0 }
		let(:header) { create :security_transaction_header, quantity: }
		let :create_json do
			{
				id: 1,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => primary_account.id
				},
				'account' => {
					'id' => account.id
				},
				'security' => {
					'id' => header.security.id
				},
				'transaction_date' => header.transaction_date,
				'status' => 'Cleared',
				'related_status' => 'Reconciled',
				'quantity' => header.quantity
			}
		end
		let :update_json do
			{
				id: transaction.id,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => primary_account.id
				},
				'account' => {
					'id' => account.id
				}
			}
		end
	end

	describe '::strip_invalid_attributes' do
		subject(:stripped) { described_class.strip_invalid_attributes json }

		let(:json) { {'memo' => 'Test json', 'price' => 1.23, 'commission' => 4.56} }

		it 'should strip the price' do
			expect(stripped).not_to have_key 'price'
		end

		it 'should strip the commission' do
			expect(stripped).not_to have_key 'commission'
		end

		it 'should retain any other attributes' do
			expect(stripped).to include 'memo' => 'Test json'
		end
	end

	describe '#as_json' do
		subject(:transaction) { create :security_transfer_transaction }

		it 'should include the quantity' do
			expect(transaction.as_json(direction: 'outflow')).to include quantity: 10
		end
	end
end
