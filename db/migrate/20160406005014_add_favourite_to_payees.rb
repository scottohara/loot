class AddFavouriteToPayees < ActiveRecord::Migration[5.1]
  def change
    add_column :payees, :favourite, :boolean, null: false, default: false
  end
end
