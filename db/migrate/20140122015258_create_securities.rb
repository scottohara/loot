class CreateSecurities < ActiveRecord::Migration
  def change
    create_table :securities do |t|
			t.string :name, :null => false

      t.timestamps
    end
  end
end
