class CreateCategories < ActiveRecord::Migration[5.1]
  def change
    create_table :categories do |t|
      t.string :name, null: false
      t.string :direction, null: false
			t.belongs_to :parent

      t.timestamps
    end
  end
end
