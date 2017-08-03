class CreateSecurityPrices < ActiveRecord::Migration[5.1]
  def change
    create_table :security_prices do |t|
			t.decimal :price, null: false
      t.date :as_at_date, null: false
			t.references :security, index: true, null: false

      t.timestamps
    end
  end
end
