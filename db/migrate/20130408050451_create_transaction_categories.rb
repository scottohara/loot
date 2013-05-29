class CreateTransactionCategories < ActiveRecord::Migration
  def change
    create_table :transaction_categories, :id => false do |t|
			t.references :transaction
			t.references :category

      t.timestamps
    end
  end
end
