class PayeeSerializer < ActiveModel::Serializer
  attributes :id, :name, :closing_balance, :num_transactions

	def num_transactions
		object.transactions.count
	end
end
