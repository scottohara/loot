class TransactionAccount < ApplicationRecord
	validates :direction, presence: true, inclusion: {in: %w(inflow outflow)}
	validates :status, inclusion: {in: %w(Cleared Reconciled)}, allow_blank: true
	belongs_to :account
	# trx is not really optional, but because the inverse has_one association is defined on a subclass of Transaction,
	# when we build of of these (trx.build_header), this association is not automatically populated
	belongs_to :trx, foreign_key: 'transaction_id', class_name: 'Transaction', optional: true
end
