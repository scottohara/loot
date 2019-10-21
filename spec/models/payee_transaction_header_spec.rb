# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PayeeTransactionHeader, type: :model do
	describe '#update_from_json' do
		let(:payee) { create :payee }
		let(:header) { create :payee_transaction_header }
		let(:json) do
			{
				'payee' => {
					'id' => payee.id
				}
			}
		end

		before do
			expect(Payee).to receive(:find_or_new).and_return payee
		end

		it 'should update a transaction header from a JSON representation' do
			expect(header.update_from_json(json).payee).to eq payee
		end
	end

	describe '#as_json' do
		subject(:transaction_header) { create :payee_transaction_header }

		let(:json) { transaction_header.as_json }

		before do
			expect(transaction_header.payee).to receive(:as_json).and_return 'payee json'
		end

		it 'should return a JSON representation' do
			expect(json).to include payee: 'payee json'
		end
	end
end
