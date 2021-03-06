class UpdateTrasactionAccountsIndexes < ActiveRecord::Migration[5.1]
  def change
		remove_index :transaction_accounts, [:account_id, :transaction_id]
		remove_index :transaction_accounts, [:transaction_id, :account_id]

		add_index :transaction_accounts, [:account_id, :transaction_id]
		add_index :transaction_accounts, [:transaction_id, :account_id]
  end
end
