class CreatePayees < ActiveRecord::Migration
  def change
    create_table :payees do |t|
      t.string :name, null: false

      t.timestamps
    end
  end
end
