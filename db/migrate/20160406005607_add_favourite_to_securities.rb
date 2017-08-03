class AddFavouriteToSecurities < ActiveRecord::Migration[5.1]
  def change
    add_column :securities, :favourite, :boolean, null: false, default: false
  end
end
