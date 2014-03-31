class CreateTransactionHeaders < ActiveRecord::Migration
  def change
    create_table :transaction_headers, :primary_key => :transaction_id do |t|
      t.date :transaction_date, :null => false
			t.references :payee, :index => true
			t.references :security, :index => true
			t.decimal :quantity
			t.decimal :price
			t.decimal :commission

      t.timestamps
    end
  end
end
