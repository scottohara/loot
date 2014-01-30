class CreateSecurityPrices < ActiveRecord::Migration
  def change
    create_table :security_prices, :id => false do |t|
			t.decimal :price, :null => false
      t.date :as_at_date, :null => false
			t.references :security

      t.timestamps
    end
  end
end
