# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe 'db:shrink', type: :task do
	let(:task_name) { 'db:shrink' }
	let(:cutoff_date) { '2001-12-31' }
	let(:before_cutoff) { '2001-01-01' }
	let(:after_cutoff) { '2002-01-01' }

	def invoke(date = cutoff_date, purge: 'purge', confirm: 'n')
		allow($stdin).to receive(:gets).and_return "#{purge}\n", "#{confirm}\n"
		original_stdout = $stdout
		original_stderr = $stderr
		$stdout = ::StringIO.new
		$stderr = ::StringIO.new
		date.nil? ? task.invoke : task.invoke(date)
	ensure
		$stdout = original_stdout
		$stderr = original_stderr
	end

	describe 'preconditions' do
		it 'should abort when no cutoff date is given' do
			expect { invoke nil }.to raise_error ::SystemExit
		end

		it 'should abort when no transactions are earlier than the cutoff date' do
			create :basic_transaction, transaction_date: after_cutoff

			expect { invoke }.to raise_error ::SystemExit
		end

		it 'should abort without purging anything when the confirmation is not "purge"' do
			trx = create :basic_transaction, transaction_date: before_cutoff

			expect { invoke purge: 'no' }.to raise_error ::SystemExit
			expect(::Transaction.exists?(trx.id)).to be true
		end
	end

	describe 'purging transactions' do
		it 'should purge transactions earlier than the cutoff date' do
			create :basic_transaction, transaction_date: before_cutoff
			create :split_transaction, transaction_date: before_cutoff, subtransactions: 1, subtransfers: 1

			expect { invoke }.to change(::Transaction, :count).by(-4)
		end

		it 'should not purge transactions on or after the cutoff date' do
			# The task aborts unless something is in range, so give it one transaction to purge
			create :basic_transaction, transaction_date: before_cutoff
			kept = create :basic_transaction, transaction_date: after_cutoff

			invoke

			expect(::Transaction.exists?(kept.id)).to be true
		end
	end

	describe 'purging entities' do
		let!(:subcategory) { create :outflow_subcategory }
		let!(:payee) { create :payee }
		let!(:security) { create :security }

		before do
			create :basic_transaction, category: subcategory, payee:, transaction_date: before_cutoff
			create :security_purchase_transaction, security:, transaction_date: before_cutoff
		end

		describe 'with no transactions' do
			it 'should not purge a top-level category' do
				invoke confirm: 'y'

				expect(::Category.exists?(subcategory.parent_id)).to be true
			end

			it 'should purge all entities' do
				invoke confirm: 'y'

				expect(::Category.exists?(subcategory.id)).to be false
				expect(::Payee.exists?(payee.id)).to be false
				expect(::Security.exists?(security.id)).to be false
			end

			it 'should not purge any entities when declined' do
				invoke confirm: 'n'

				expect(::Category.exists?(subcategory.id)).to be true
				expect(::Payee.exists?(payee.id)).to be true
				expect(::Security.exists?(security.id)).to be true
			end
		end

		describe 'with transactions' do
			before do
				create :basic_transaction, category: subcategory, payee:, transaction_date: after_cutoff
				create :security_purchase_transaction, security:, transaction_date: after_cutoff
			end

			it 'should not purge any entities' do
				invoke confirm: 'y'

				expect(::Category.exists?(subcategory.id)).to be true
				expect(::Payee.exists?(payee.id)).to be true
				expect(::Security.exists?(security.id)).to be true
			end
		end
	end

	it 'should restore the original log level after purging' do
		create :basic_transaction, transaction_date: before_cutoff

		expect { invoke }.not_to change(::ActiveRecord::Base.logger, :level)
	end

	it 'should restore the original log level after aborting' do
		original_log_level = ::ActiveRecord::Base.logger.level
		create :basic_transaction, transaction_date: after_cutoff

		expect { invoke }.to raise_error ::SystemExit
		expect(::ActiveRecord::Base.logger.level).to eq original_log_level
	end
end
