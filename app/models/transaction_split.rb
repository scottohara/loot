class TransactionSplit < ActiveRecord::Base
	belongs_to :transaction
	belongs_to :parent, :class_name => 'SplitTransaction', :foreign_key => 'parent_id', :inverse_of => :transaction_splits
	
	def build_transaction(*args, &block)
		super *args, &block
		raise "Transaction type must be set first" if self.transaction.transaction_type.nil?
		case self.transaction.transaction_type
		when "Basic"
			self.transaction = self.transaction.becomes(Subtransaction)
		when "Subtransfer"
			raise "Parent transaction header must be set first" if self.parent.header.nil?
			self.transaction = self.transaction.becomes(SubtransferTransaction)
			self.transaction.build_header(:transaction_date => self.parent.header.transaction_date).payee = self.parent.header.payee
		else
			raise "Transaction type #{self.transasction.transaction_type} is not valid in a split transaction"
		end
		self.transaction
	end
end
