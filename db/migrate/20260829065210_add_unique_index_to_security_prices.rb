class AddUniqueIndexToSecurityPrices < ActiveRecord::Migration[8.1]
  def change
    add_index :security_prices, %i[security_id as_at_date], unique: true, order: {as_at_date: :desc}
    remove_index :security_prices, %i[security_id as_at_date id], order: {as_at_date: :desc, id: :desc}
  end
end
