class PayeeSerializer < ActiveModel::Serializer
  attributes :id, :name, :closing_balance
end
