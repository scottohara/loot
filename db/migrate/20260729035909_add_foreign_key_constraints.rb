class AddForeignKeyConstraints < ActiveRecord::Migration[8.1]
  def change
    add_foreign_key :accounts, :accounts, column: :related_account_id
    add_foreign_key :categories, :categories, column: :parent_id
    add_foreign_key :security_prices, :securities
    add_foreign_key :transaction_accounts, :accounts
    add_foreign_key :transaction_accounts, :transactions
    add_foreign_key :transaction_categories, :categories
    add_foreign_key :transaction_categories, :transactions
    add_foreign_key :transaction_flags, :transactions
    add_foreign_key :transaction_headers, :payees
    add_foreign_key :transaction_headers, :schedules
    add_foreign_key :transaction_headers, :securities
    add_foreign_key :transaction_headers, :transactions
    add_foreign_key :transaction_splits, :transactions
    add_foreign_key :transaction_splits, :transactions, column: :parent_id
  end
end
