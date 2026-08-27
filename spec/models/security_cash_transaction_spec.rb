# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::SecurityCashTransaction do
	subject(:transaction) { described_class.new }

	describe '#investment_account' do
		let(:account) { create :investment_account }

		before do
			transaction.transaction_accounts.build(direction: 'outflow').account = account
			transaction.transaction_accounts.build(direction: 'inflow').account = create :bank_account
		end

		it "should return the first account of type 'investment'" do
			expect(transaction.investment_account.account).to eq account
		end

		it 'should return nil when a transaction account has no account' do
			transaction.transaction_accounts.each { |trx_account| trx_account.account = nil }
			expect(transaction.investment_account).to be_nil
		end
	end

	describe '#cash_account' do
		let(:account) { create :bank_account }

		before do
			transaction.transaction_accounts.build(direction: 'outflow').account = create :investment_account
			transaction.transaction_accounts.build(direction: 'inflow').account = account
		end

		it "should return the first account of type 'bank'" do
			expect(transaction.cash_account.account).to eq account
		end

		it 'should return nil when a transaction account has no account' do
			transaction.transaction_accounts.each { |trx_account| trx_account.account = nil }
			expect(transaction.cash_account).to be_nil
		end
	end

	describe '#validate_cash_account_type' do
		let(:error_message) { 'Cash account must be a bank account' }

		before do
			transaction.transaction_accounts.build(direction: 'outflow').account = create :investment_account
		end

		it 'should be an error if the cash account is not a bank account' do
			transaction.transaction_accounts.build(direction: 'inflow').account = create :cash_account
			transaction.validate_cash_account_type
			expect(transaction.errors[:base]).to include error_message
		end

		it 'should not be an error if the cash account is a bank account' do
			transaction.transaction_accounts.build(direction: 'inflow').account = create :bank_account
			transaction.validate_cash_account_type
			expect(transaction.errors[:base]).not_to include error_message
		end
	end
end
