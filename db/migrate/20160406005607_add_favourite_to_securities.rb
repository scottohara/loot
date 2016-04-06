class AddFavouriteToSecurities < ActiveRecord::Migration
  def change
    add_column :securities, :favourite, :boolean, null: false, default: false
  end
end
