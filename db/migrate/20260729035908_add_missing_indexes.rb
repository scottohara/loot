class AddMissingIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :accounts, :related_account_id
    add_index :categories, :parent_id
    add_index :transaction_headers, :schedule_id
    add_index :transaction_splits, :parent_id
    add_index :transaction_headers, :transaction_date
    add_index :security_prices, %i[security_id as_at_date id], order: {as_at_date: :desc, id: :desc}
    remove_index :security_prices, :security_id
  end
end
