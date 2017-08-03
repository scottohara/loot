class CreateSecurities < ActiveRecord::Migration[5.1]
  def change
    create_table :securities do |t|
			t.string :name, null: false
			t.string :code

      t.timestamps
    end
  end
end
