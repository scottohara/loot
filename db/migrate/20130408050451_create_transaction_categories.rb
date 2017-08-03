class CreateTransactionCategories < ActiveRecord::Migration[5.1]
  def change
    create_table :transaction_categories, primary_key: :transaction_id do |t|
			t.references :category, index: true, null: false

      t.timestamps
    end
  end
end
