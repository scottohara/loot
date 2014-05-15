# Disable root for all serializers (except ArraySerializer)
ActiveModel::Serializer.root = false

# Disable root for ArraySerializer
ActiveModel::ArraySerializer.root = false
