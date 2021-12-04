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

ActiveRecord::Schema.define(version: 2021_12_03_035750) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accounts", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "account_type", limit: 255, null: false
    t.decimal "opening_balance", null: false
    t.string "status", limit: 255, null: false
    t.integer "related_account_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "favourite", default: false, null: false
  end

  create_table "categories", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "direction", limit: 255, null: false
    t.integer "parent_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "favourite", default: false, null: false
  end

  create_table "payees", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "favourite", default: false, null: false
  end

  create_table "schedules", id: :serial, force: :cascade do |t|
    t.date "next_due_date", null: false
    t.string "frequency", limit: 255, null: false
    t.boolean "estimate", null: false
    t.boolean "auto_enter", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "securities", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "code", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "favourite", default: false, null: false
  end

  create_table "security_prices", id: :serial, force: :cascade do |t|
    t.decimal "price", null: false
    t.date "as_at_date", null: false
    t.integer "security_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["security_id"], name: "index_security_prices_on_security_id"
  end

  create_table "transaction_accounts", id: :serial, force: :cascade do |t|
    t.integer "transaction_id", null: false
    t.integer "account_id", null: false
    t.string "direction", limit: 255, null: false
    t.string "status", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["account_id", "transaction_id"], name: "index_transaction_accounts_on_account_id_and_transaction_id"
    t.index ["transaction_id", "account_id"], name: "index_transaction_accounts_on_transaction_id_and_account_id"
  end

  create_table "transaction_categories", primary_key: "transaction_id", id: :serial, force: :cascade do |t|
    t.integer "category_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["category_id"], name: "index_transaction_categories_on_category_id"
  end

  create_table "transaction_flags", primary_key: "transaction_id", id: :serial, force: :cascade do |t|
    t.string "memo", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "flag_type", default: "followup", null: false
  end

  create_table "transaction_headers", primary_key: "transaction_id", id: :serial, force: :cascade do |t|
    t.integer "payee_id"
    t.integer "security_id"
    t.integer "schedule_id"
    t.date "transaction_date"
    t.decimal "quantity"
    t.decimal "price"
    t.decimal "commission"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["payee_id"], name: "index_transaction_headers_on_payee_id"
    t.index ["security_id"], name: "index_transaction_headers_on_security_id"
  end

  create_table "transaction_splits", id: :serial, force: :cascade do |t|
    t.integer "transaction_id", null: false
    t.integer "parent_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["transaction_id", "parent_id"], name: "index_transaction_splits_on_transaction_id_and_parent_id", unique: true
  end

  create_table "transactions", id: :serial, force: :cascade do |t|
    t.decimal "amount"
    t.text "memo"
    t.string "transaction_type", limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
