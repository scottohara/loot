class AccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :opening_balance, :status, :closing_balance
end
