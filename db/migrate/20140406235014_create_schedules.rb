class CreateSchedules < ActiveRecord::Migration[5.1]
  def change
    create_table :schedules do |t|
			t.date :next_due_date, null: false
			t.string :frequency, null: false
			t.boolean :estimate, null: false
			t.boolean :auto_enter, null: false

			t.timestamps
    end
  end
end
