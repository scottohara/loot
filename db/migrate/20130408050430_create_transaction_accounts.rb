class CreateTransactionAccounts < ActiveRecord::Migration
  def change
    create_table :transaction_accounts, :id => false do |t|
      t.string :direction, :null => false
			t.references :account
			t.references :transaction

      t.timestamps
    end
  end
end
