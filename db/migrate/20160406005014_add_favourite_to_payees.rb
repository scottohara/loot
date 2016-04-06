class AddFavouriteToPayees < ActiveRecord::Migration
  def change
    add_column :payees, :favourite, :boolean, null: false, default: false
  end
end
