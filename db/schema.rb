# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140122015709) do

  create_table "accounts", force: true do |t|
    t.string   "name",               null: false
    t.string   "account_type",       null: false
    t.decimal  "opening_balance",    null: false
    t.integer  "related_account_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "categories", force: true do |t|
    t.string   "name",       null: false
    t.string   "direction",  null: false
    t.integer  "parent_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "payees", force: true do |t|
    t.string   "name",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "securities", force: true do |t|
    t.string   "name",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "security_prices", id: false, force: true do |t|
    t.decimal  "price",       null: false
    t.date     "as_at_date",  null: false
    t.integer  "security_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "transaction_accounts", id: false, force: true do |t|
    t.string   "direction",      null: false
    t.integer  "account_id"
    t.integer  "transaction_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "transaction_categories", id: false, force: true do |t|
    t.integer  "transaction_id"
    t.integer  "category_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "transaction_headers", id: false, force: true do |t|
    t.date     "transaction_date", null: false
    t.integer  "transaction_id"
    t.integer  "payee_id"
    t.integer  "security_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "transaction_splits", id: false, force: true do |t|
    t.integer  "transaction_id"
    t.integer  "parent_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "transactions", force: true do |t|
    t.decimal  "amount"
    t.decimal  "quantity"
    t.decimal  "commission"
    t.text     "memo"
    t.string   "transaction_type", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
