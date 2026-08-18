class AddEnumCheckConstraints < ActiveRecord::Migration[8.1]
  def change
    add_check_constraint :accounts, "account_type IN ('bank', 'credit', 'cash', 'asset', 'liability', 'investment', 'loan')", name: 'accounts_account_type_check'
    add_check_constraint :accounts, "status IN ('open', 'closed')", name: 'accounts_status_check'
    add_check_constraint :categories, "direction IN ('inflow', 'outflow')", name: 'categories_direction_check'
    add_check_constraint :schedules, "frequency IN ('Weekly', 'Fortnightly', 'Monthly', 'Bimonthly', 'Quarterly', 'Yearly')", name: 'schedules_frequency_check'
    add_check_constraint :transaction_accounts, "direction IN ('inflow', 'outflow')", name: 'transaction_accounts_direction_check'
    add_check_constraint :transaction_accounts, "status IS NULL OR status IN ('Cleared', 'Reconciled')", name: 'transaction_accounts_status_check'
    add_check_constraint :transaction_flags, "flag_type IN ('followup', 'noreceipt', 'taxdeductible')", name: 'transaction_flags_flag_type_check'
    add_check_constraint :transactions, "transaction_type IN ('Basic', 'Split', 'Transfer', 'Payslip', 'LoanRepayment', 'Sub', 'Subtransfer', 'SecurityTransfer', 'SecurityHolding', 'SecurityInvestment', 'Dividend')", name: 'transactions_transaction_type_check'
  end
end
