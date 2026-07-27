# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'models/concerns/transferable'
require 'rails_helper'

::RSpec.describe ::TransferTransaction do
	matcher :match_json do |expected, source_account, destination_account, header|
		match do |actual|
			actual[:transaction_type].eql?('Transfer') &&
				actual[:id].eql?(expected[:id]) &&
				actual[:amount].eql?(expected['amount']) &&
				actual[:memo].eql?(expected['memo']) &&
				actual[:primary_account][:id].eql?(source_account.id) &&
				actual[:status].eql?(expected['status']) &&
				actual[:account][:id].eql?(destination_account.id) &&
				actual[:related_status].eql?(expected['related_status']) &&
				actual[:payee][:id].eql?(header.payee.id) &&
				actual[:transaction_date].eql?(header.transaction_date)
		end
	end

	it_behaves_like ::Transferable do
		let(:factory) { :transfer_transaction }
		let(:primary_account) { create :bank_account }
		let(:account) { create :bank_account }
		let(:header) { create :payee_transaction_header }
		let :create_json do
			{
				id: 1,
				'amount' => 1,
				'memo' => 'Test json',
				'primary_account' => {
					'id' => primary_account.id
				},
				'account' => {
					'id' => account.id
				},
				'payee' => {
					'id' => header.payee.id
				},
				'transaction_date' => header.transaction_date,
				'status' => 'Cleared',
				'related_status' => 'Reconciled'
			}
		end
		let :update_json do
			{
				id: transaction.id,
				'amount' => 1,
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
end
