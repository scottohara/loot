class SecuritySerializer < ActiveModel::Serializer
  attributes :id, :name, :code, :closing_balance
end
