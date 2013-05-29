class CreateTransactionSplits < ActiveRecord::Migration
  def change
    create_table :transaction_splits, :id => false do |t|
			t.references :transaction
			t.belongs_to :parent

      t.timestamps
    end
  end
end
