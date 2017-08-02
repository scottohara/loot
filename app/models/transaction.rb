# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Transaction
class Transaction < ApplicationRecord
	validates :transaction_type, presence: true, inclusion: {in: %w[Basic Split Transfer Payslip LoanRepayment Sub Subtransfer SecurityTransfer SecurityHolding SecurityInvestment Dividend]}
	has_one :flag, class_name: 'TransactionFlag', foreign_key: 'transaction_id', dependent: :destroy, autosave: true, inverse_of: :trx

	include Categorisable

	class << self
		include Transactable

		def class_for(type)
			"#{type}Transaction".constantize
		end

		def types_for(account_type)
			account_type.eql?('investment') && %w[SecurityTransfer SecurityHolding SecurityInvestment Dividend] || %w[Basic Split Transfer Payslip LoanRepayment]
		end

		# Transactable concern expects a transactions association, so just return self
		def transactions
			self
		end

		def for_ledger(opts)
			joins(
				[
					'LEFT OUTER JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id',
					'LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id',
					'LEFT OUTER JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id OR transaction_headers.transaction_id = transaction_splits.parent_id',
					'LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id'
				]
			)
				.where('transactions.transaction_type != \'Subtransfer\'')
				.where 'LOWER(transactions.memo) LIKE ?', "%#{opts[:query].downcase}%"
		end

		def for_closing_balance(opts)
			joins(
				[
					'JOIN transaction_accounts ON transaction_accounts.transaction_id = transactions.id',
					'JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id'
				]
			)
				.where 'LOWER(transactions.memo) LIKE ?', "%#{opts[:query].downcase}%"
		end

		def for_basic_closing_balance(opts)
			joins(
				[
					'JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id',
					'LEFT OUTER JOIN transaction_splits ON transaction_splits.transaction_id = transactions.id',
					'JOIN transaction_headers ON transaction_headers.transaction_id = transactions.id OR transaction_headers.transaction_id = transaction_splits.parent_id'
				]
			)
				.where 'LOWER(transactions.memo) LIKE ?', "%#{opts[:query].downcase}%"
		end

		def opening_balance
			0
		end

		def account_type
			nil
		end

		def create_from_json(json)
			# id included for the case where we destroy & recreate on transaction type change
			s = new id: json[:id], memo: json['memo']
			s.build_flag memo: json['flag'] unless json['flag'].nil?
			s
		end
	end

	def as_subclass
		becomes self.class.class_for transaction_type
	end

	def update_from_json(json)
		self.memo = json['memo']
		if json['flag'].nil?
			unless flag.nil?
				flag.destroy!
				self.flag = nil
			end
		else
			flag.nil? ? build_flag(memo: json['flag']) : flag.memo = json['flag']
		end
		self
	end

	def as_json(_options = {})
		{
			id: id,
			transaction_type: transaction_type,
			memo: memo,
			flag: flag.present? && flag.memo || nil
		}
	end
end
