class CreateTransactionAccounts < ActiveRecord::Migration
  def change
    create_table :transaction_accounts do |t|
			t.references :transaction, null: false
			t.references :account, null: false
			t.string :direction, null: false
			t.string :status

			t.timestamps
    end
		add_index :transaction_accounts, [:account_id, :transaction_id], unique: true
		add_index :transaction_accounts, [:transaction_id, :account_id], unique: true
  end
end
