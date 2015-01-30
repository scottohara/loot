class CreateTransactionSplits < ActiveRecord::Migration
  def change
    create_table :transaction_splits do |t|
			t.references :transaction, null: false
			t.belongs_to :parent, null: false

      t.timestamps
    end
		add_index :transaction_splits, [:transaction_id, :parent_id], unique: true
  end
end
