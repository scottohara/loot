class AddFavouriteToAccounts < ActiveRecord::Migration
  def change
    add_column :accounts, :favourite, :boolean, null: false, default: false
  end
end
