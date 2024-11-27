# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require_relative 'db_e2e'

::DB::E2E.create_test_data(:schedules) do
	# Create associated entities
	bank_account = create :bank_account
	investment_account = create :investment_account
	payee = create :payee
	expense_subcategory = create :outflow_subcategory
	income_subcategory = create :inflow_subcategory
	security = create :security

	# Create schedules of all types
	create :basic_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), account: bank_account, payee:, category: expense_subcategory
	create :basic_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), account: bank_account, payee:, category: income_subcategory
	create(:transfer_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), source_account: bank_account, payee:)
	create :split_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), account: bank_account, payee:, category: expense_subcategory, subtransactions: 2
	create :loan_repayment_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), account: bank_account, payee:, category: expense_subcategory, subtransactions: 2
	create :payslip_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), account: bank_account, payee:, category: income_subcategory, subtransactions: 2
	create :security_purchase_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), security:, investment_account:, cash_account: investment_account.related_account
	create :security_sale_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), security:, investment_account:, cash_account: investment_account.related_account
	create :security_add_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), security:, account: investment_account
	create :security_remove_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), security:, account: investment_account
	create :security_transfer_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), security:, source_account: investment_account
	create :dividend_transaction, :scheduled, next_due_date: ::Time.zone.today.advance(days: 1), security:, investment_account:, cash_account: bank_account
end
