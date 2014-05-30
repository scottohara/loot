class TransactionSplit < ActiveRecord::Base
	validate :validate_transaction_type_inclusion
	belongs_to :trx, :foreign_key => 'transaction_id', :class_name => 'Transaction'
	belongs_to :parent, :class_name => 'SplitTransaction', :foreign_key => 'parent_id', :inverse_of => :transaction_splits
	before_destroy :destroy_transaction
	
	def validate_transaction_type_inclusion
		errors[:base] << "Transaction type #{trx.transaction_type} is not valid in a split transaction" unless %w(Sub Subtransfer).include?(trx.transaction_type)
	end

	def build_trx(*args, &block)
		super *args, &block
		raise "Transaction type must be set first" if self.trx.transaction_type.nil?
		self.trx = Transaction.class_for(self.trx.transaction_type).new self.trx.attributes

		if self.trx.transaction_type.eql? "Subtransfer"
			raise "Parent transaction header must be set first" if self.parent.header.nil?
			self.trx.build_header(:transaction_date => self.parent.header.transaction_date).payee = self.parent.header.payee
		end

		self.trx
	end

	def destroy_transaction
		self.trx.as_subclass.destroy
	end
end
