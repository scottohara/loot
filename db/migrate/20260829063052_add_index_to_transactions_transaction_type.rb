class AddIndexToTransactionsTransactionType < ActiveRecord::Migration[8.1]
  def change
    add_index :transactions, :transaction_type
  end
end
