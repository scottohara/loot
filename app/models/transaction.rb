class Transaction < ActiveRecord::Base
	validates :transaction_type, presence: true, inclusion: {in: %w(Basic Split Transfer Payslip LoanRepayment Sub Subtransfer SecurityTransfer SecurityHolding SecurityInvestment Dividend)}
	has_one :flag, class_name: 'TransactionFlag', foreign_key: 'transaction_id', dependent: :destroy, autosave: true

	include Categorisable
		
	class << self
		include Transactable

		def class_for(type)
			"#{type}Transaction".constantize
		end

		def types_for(account_type)
			account_type.eql?('investment') && %w(SecurityTransfer SecurityHolding SecurityInvestment Dividend) || %w(Basic Split Transfer Payslip LoanRepayment)
		end

		# Transactable concern expects a transactions association, so just return self
		def transactions
			self
		end

		def for_ledger(opts)
			joins([	"LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id OR transaction_headers.transaction_id = transaction_splits.parent_id",
							"LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id"])
			.where(	"transactions.transaction_type != 'Subtransfer'")
			.where(	"LOWER(transactions.memo) LIKE ?", "%#{opts[:query].downcase}%")
		end

		def for_closing_balance(opts)
			joins([	"JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id",
							"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id"])
			.where(	"LOWER(transactions.memo) LIKE ?", "%#{opts[:query].downcase}%")
		end

		def for_basic_closing_balance(opts)
			joins([	"JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id",
							"LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id",
							"JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id OR transaction_headers.transaction_id = transaction_splits.parent_id"])
			.where(	"LOWER(transactions.memo) LIKE ?", "%#{opts[:query].downcase}%")
		end

		def opening_balance
			0
		end

		def account_type
			nil
		end

		def create_from_json(json)
			# id included for the case where we destroy & recreate on transaction type change 
			s = self.new(id: json[:id], memo: json['memo'])
			s.build_flag(memo: json['flag']) unless json['flag'].nil?
			s
		end
	end

	def as_subclass
		self.becomes self.class.class_for(self.transaction_type)
	end

	def update_from_json(json)
		self.memo = json['memo']
		unless json['flag'].nil?
			if self.flag.nil?
				self.build_flag(memo: json['flag'])
			else
				self.flag.memo = json['flag']
			end
		else
			unless self.flag.nil?
				self.flag.destroy
				self.flag = nil
			end
		end
		self
	end

	def as_json(options={})
		{
			id: self.id,
			transaction_type: self.transaction_type,
			memo: self.memo,
			flag: self.flag.present? && self.flag.memo || nil
		}
	end
end
