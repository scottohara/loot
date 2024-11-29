# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Split transaction
class SplitTransaction < PayeeCashTransaction
	has_one :transaction_account, foreign_key: 'transaction_id', autosave: true, dependent: :destroy
	has_one :account, through: :transaction_account
	has_many :transaction_splits, foreign_key: 'parent_id', inverse_of: :parent, dependent: :destroy
	has_many :subtransactions, -> { where transaction_type: 'Sub' }, class_name: 'SubTransaction', through: :transaction_splits, source: :trx
	has_many :subtransfers, -> { where transaction_type: 'Subtransfer' }, class_name: 'SubtransferTransaction', through: :transaction_splits, source: :trx
	after_initialize do |t|
		t.transaction_type = 'Split'
	end

	include ::Categorisable

	class << self
		def create_from_json(json)
			s = super
			s.build_transaction_account(direction: json['direction'], status: json['status']).account = ::Account.find json['primary_account']['id']
			s.create_children json['subtransactions']
			s.save!
			s
		end

		def update_from_json(json)
			s = includes(:header, :transaction_account).find json[:id]
			s.update_from_json json
			s
		end
	end

	def update_from_json(json)
		super
		transaction_account.direction = json['direction']
		self.account = ::Account.find json['primary_account']['id']
		subtransactions.each(&:destroy)
		subtransfers.each(&:destroy)
		create_children json['subtransactions']
		save!
	end

	def as_json(options = {})
		super.merge(
			primary_account: account.as_json,
			category: {
				id: (transaction_account.direction.eql?('inflow') && 'SplitFrom') || 'SplitTo',
				name: (transaction_account.direction.eql?('inflow') && 'Split From') || 'Split To'
			},
			direction: transaction_account.direction,
			status: transaction_account.status
		)
	end

	def children
		# Get the child transactions
		transactions =
			::TransactionSplit
			.select(
				'transactions.id',
				'transactions.transaction_type',
				'parent_transactions.transaction_type AS parent_transaction_type',
				'categories.id AS category_id',
				'categories.name AS category_name',
				'categories.direction AS category_direction',
				'parent_categories.id AS parent_category_id',
				'parent_categories.name AS parent_category_name',
				'accounts.id AS account_id',
				'accounts.name AS account_name',
				'transactions.amount',
				'transaction_accounts.direction',
				'transactions.memo',
				'transaction_flags.flag_type',
				'transaction_flags.memo AS flag'
			)
			.joins(
				[
					'JOIN transaction_accounts ON transaction_accounts.transaction_id = transaction_splits.parent_id',
					'JOIN transactions ON transactions.id = transaction_splits.transaction_id',
					'JOIN transactions parent_transactions ON parent_transactions.id = transaction_splits.parent_id',
					'LEFT OUTER JOIN transaction_categories ON transaction_categories.transaction_id = transactions.id',
					'LEFT OUTER JOIN categories ON categories.id = transaction_categories.category_id',
					'LEFT OUTER JOIN categories parent_categories ON parent_categories.id = categories.parent_id',
					'LEFT OUTER JOIN transaction_accounts transfer_transaction_accounts ON transfer_transaction_accounts.transaction_id = transactions.id AND transfer_transaction_accounts.account_id != transaction_accounts.account_id',
					'LEFT OUTER JOIN accounts ON accounts.id = transfer_transaction_accounts.account_id',
					'LEFT OUTER JOIN transaction_flags ON transaction_flags.transaction_id = transactions.id'
				]
			)
			.where transaction_splits: {parent_id: id}

		# Remap to the desired output format
		transactions.map do |trx|
			{
				id: trx['id'],
				transaction_type: trx['transaction_type'],
				category: self.class.transaction_category(trx),
				subcategory: self.class.basic_subcategory(trx),
				account: {
					id: trx['account_id'],
					name: trx['account_name']
				},
				amount: trx['amount'],
				direction: (trx['transaction_type'].eql?('Subtransfer') && ((trx['parent_transaction_type'].eql?('Payslip') && 'outflow') || trx['direction'])) || trx['category_direction'],
				memo: trx['memo'],
				flag_type: trx['flag_type'],
				flag: trx['flag']
			}
		end
	end

	def create_children(children)
		children.each do |child|
			# Keys could be symbols or strings
			child = child.with_indifferent_access if child.is_a?(::Hash)

			# Clear the id and copy the header details from the parent
			child['id'] = nil
			child['transaction_date'] = header.transaction_date
			child['payee'] = {id: header.payee.id}

			unless header.schedule.nil?
				child['next_due_date'] = header.schedule.next_due_date
				child['frequency'] = header.schedule.frequency
			end

			transaction_splits.build.trx = ::Transaction.class_for(child['transaction_type']).create_from_json child
		end
	end
end
