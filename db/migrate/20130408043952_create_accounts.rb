class CreateAccounts < ActiveRecord::Migration
  def change
    create_table :accounts do |t|
      t.string :name, null: false
      t.string :account_type, null: false
      t.decimal :opening_balance, null: false
			t.string :status, null: false
			t.references :related_account

      t.timestamps
    end
  end
end
