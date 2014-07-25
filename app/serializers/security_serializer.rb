class SecuritySerializer < ActiveModel::Serializer
  attributes :id, :name, :code, :closing_balance, :num_transactions

	def num_transactions
		object.transactions.count
	end
end
