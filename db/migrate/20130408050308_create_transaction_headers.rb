class CreateTransactionHeaders < ActiveRecord::Migration
  def change
    create_table :transaction_headers, :id => false do |t|
      t.date :transaction_date, :null => false
			t.references :transaction
			t.references :payee

      t.timestamps
    end
  end
end
