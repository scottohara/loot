# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_07_29_035909) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "accounts", id: :serial, force: :cascade do |t|
    t.string "account_type", limit: 255, null: false
    t.datetime "created_at", precision: nil
    t.boolean "favourite", default: false, null: false
    t.string "name", limit: 255, null: false
    t.decimal "opening_balance", null: false
    t.integer "related_account_id"
    t.string "status", limit: 255, null: false
    t.datetime "updated_at", precision: nil
    t.index ["related_account_id"], name: "index_accounts_on_related_account_id"
  end

  create_table "categories", id: :serial, force: :cascade do |t|
    t.datetime "created_at", precision: nil
    t.string "direction", limit: 255, null: false
    t.boolean "favourite", default: false, null: false
    t.string "name", limit: 255, null: false
    t.integer "parent_id"
    t.datetime "updated_at", precision: nil
    t.index ["parent_id"], name: "index_categories_on_parent_id"
  end

  create_table "payees", id: :serial, force: :cascade do |t|
    t.datetime "created_at", precision: nil
    t.boolean "favourite", default: false, null: false
    t.string "name", limit: 255, null: false
    t.datetime "updated_at", precision: nil
  end

  create_table "schedules", id: :serial, force: :cascade do |t|
    t.boolean "auto_enter", null: false
    t.datetime "created_at", precision: nil
    t.boolean "estimate", null: false
    t.string "frequency", limit: 255, null: false
    t.date "next_due_date", null: false
    t.datetime "updated_at", precision: nil
  end

  create_table "securities", id: :serial, force: :cascade do |t|
    t.string "code", limit: 255
    t.datetime "created_at", precision: nil
    t.boolean "favourite", default: false, null: false
    t.string "name", limit: 255, null: false
    t.datetime "updated_at", precision: nil
  end

  create_table "security_prices", id: :serial, force: :cascade do |t|
    t.date "as_at_date", null: false
    t.datetime "created_at", precision: nil
    t.decimal "price", null: false
    t.integer "security_id", null: false
    t.datetime "updated_at", precision: nil
    t.index ["security_id", "as_at_date", "id"], name: "index_security_prices_on_security_id_and_as_at_date_and_id", order: { as_at_date: :desc, id: :desc }
  end

  create_table "transaction_accounts", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.datetime "created_at", precision: nil
    t.string "direction", limit: 255, null: false
    t.string "status", limit: 255
    t.integer "transaction_id", null: false
    t.datetime "updated_at", precision: nil
    t.index ["account_id", "transaction_id"], name: "index_transaction_accounts_on_account_id_and_transaction_id"
    t.index ["transaction_id", "account_id"], name: "index_transaction_accounts_on_transaction_id_and_account_id"
  end

  create_table "transaction_categories", primary_key: "transaction_id", id: :serial, force: :cascade do |t|
    t.integer "category_id", null: false
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["category_id"], name: "index_transaction_categories_on_category_id"
  end

  create_table "transaction_flags", primary_key: "transaction_id", id: :serial, force: :cascade do |t|
    t.datetime "created_at", precision: nil
    t.string "flag_type", default: "followup", null: false
    t.string "memo", limit: 255
    t.datetime "updated_at", precision: nil
  end

  create_table "transaction_headers", primary_key: "transaction_id", id: :serial, force: :cascade do |t|
    t.decimal "commission"
    t.datetime "created_at", precision: nil
    t.integer "payee_id"
    t.decimal "price"
    t.decimal "quantity"
    t.integer "schedule_id"
    t.integer "security_id"
    t.date "transaction_date"
    t.datetime "updated_at", precision: nil
    t.index ["payee_id"], name: "index_transaction_headers_on_payee_id"
    t.index ["schedule_id"], name: "index_transaction_headers_on_schedule_id"
    t.index ["security_id"], name: "index_transaction_headers_on_security_id"
    t.index ["transaction_date"], name: "index_transaction_headers_on_transaction_date"
  end

  create_table "transaction_splits", id: :serial, force: :cascade do |t|
    t.datetime "created_at", precision: nil
    t.integer "parent_id", null: false
    t.integer "transaction_id", null: false
    t.datetime "updated_at", precision: nil
    t.index ["parent_id"], name: "index_transaction_splits_on_parent_id"
    t.index ["transaction_id", "parent_id"], name: "index_transaction_splits_on_transaction_id_and_parent_id", unique: true
  end

  create_table "transactions", id: :serial, force: :cascade do |t|
    t.decimal "amount"
    t.datetime "created_at", precision: nil
    t.text "memo"
    t.string "transaction_type", limit: 255, null: false
    t.datetime "updated_at", precision: nil
  end

  add_foreign_key "accounts", "accounts", column: "related_account_id"
  add_foreign_key "categories", "categories", column: "parent_id"
  add_foreign_key "security_prices", "securities"
  add_foreign_key "transaction_accounts", "accounts"
  add_foreign_key "transaction_accounts", "transactions"
  add_foreign_key "transaction_categories", "categories"
  add_foreign_key "transaction_categories", "transactions"
  add_foreign_key "transaction_flags", "transactions"
  add_foreign_key "transaction_headers", "payees"
  add_foreign_key "transaction_headers", "schedules"
  add_foreign_key "transaction_headers", "securities"
  add_foreign_key "transaction_headers", "transactions"
  add_foreign_key "transaction_splits", "transactions"
  add_foreign_key "transaction_splits", "transactions", column: "parent_id"
end
