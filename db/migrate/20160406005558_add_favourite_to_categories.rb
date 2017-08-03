class AddFavouriteToCategories < ActiveRecord::Migration[5.1]
  def change
    add_column :categories, :favourite, :boolean, null: false, default: false
  end
end
