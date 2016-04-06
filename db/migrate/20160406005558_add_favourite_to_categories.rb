class AddFavouriteToCategories < ActiveRecord::Migration
  def change
    add_column :categories, :favourite, :boolean, null: false, default: false
  end
end
