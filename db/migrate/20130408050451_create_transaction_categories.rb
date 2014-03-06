class CreateTransactionCategories < ActiveRecord::Migration
  def change
    create_table :transaction_categories, :id => false do |t|
			t.references :transaction, :null => false
			t.references :category, :null => false

      t.timestamps
    end
		add_index :transaction_categories, [:transaction_id, :category_id], :unique => true
  end
end
