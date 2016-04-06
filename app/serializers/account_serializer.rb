class AccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :opening_balance, :status, :closing_balance, :num_transactions, :related_account, :favourite

	def opening_balance
		object.opening_balance.to_f
	end

	def closing_balance
		object.closing_balance.to_f
	end

	def num_transactions
		object.transactions.count
	end

	def related_account
		AccountSerializer.new object.related_account, only: [:id, :name, :account_type, :opening_balance, :status] if object.related_account
	end
end
