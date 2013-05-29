class CreateTransactions < ActiveRecord::Migration
  def change
    create_table :transactions do |t|
      t.decimal :amount, :null => false
      t.text :memo
      t.string :transaction_type, :null => false

      t.timestamps
    end
  end
end
