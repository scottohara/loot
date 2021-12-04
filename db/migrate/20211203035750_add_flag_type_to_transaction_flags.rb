class AddFlagTypeToTransactionFlags < ActiveRecord::Migration[6.1]
  def change
    add_column :transaction_flags, :flag_type, :string, null: false, default: 'followup'
  end
end
