class AccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :opening_balance, :status, :closing_balance, :num_transactions

	def num_transactions
		object.transactions.count
	end
end
