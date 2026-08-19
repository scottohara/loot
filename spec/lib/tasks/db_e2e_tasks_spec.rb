# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe 'db:e2e', type: :task do
	let(:task_name) { "db:e2e:#{name}" }

	before do
		allow(::ActiveRecord::Base).to receive :establish_connection
		allow(::ActiveRecord::Tasks::DatabaseTasks).to receive :truncate_all

		task.invoke
	end

	shared_examples 'an e2e seed task' do
		it 'should connect to the test database and truncate it before seeding' do
			expect(::ActiveRecord::Base).to have_received(:establish_connection).with :test
			expect(::ActiveRecord::Tasks::DatabaseTasks).to have_received(:truncate_all).with 'test'
		end
	end

	describe 'accounts' do
		let(:name) { :accounts }

		it_behaves_like 'an e2e seed task'

		it 'should create an account of every type it seeds' do
			expect(::Account.distinct.pluck(:account_type)).to match_array %w[bank cash credit investment loan]
		end

		it 'should create exactly one favourite account' do
			expect(::Account.where(favourite: true).count).to eq 1
		end

		it 'should create a closed account' do
			expect(::Account.where(status: 'closed').count).to eq 1
		end

		it 'should give each investment account a related cash account' do
			expect(::Account.where(account_type: 'investment')).to all(have_attributes(related_account: be_present))
		end
	end

	describe 'payees' do
		let(:name) { :payees }

		it_behaves_like 'an e2e seed task'

		it 'should create 20 payees' do
			expect(::Payee.count).to eq 20
		end

		it 'should create exactly one favourite payee' do
			expect(::Payee.where(favourite: true).count).to eq 1
		end
	end

	describe 'categories' do
		let(:name) { :categories }

		it_behaves_like 'an e2e seed task'

		it 'should create 8 top level categories' do
			expect(::Category.where(parent_id: nil).count).to eq 8
		end

		it 'should create both inflow and outflow categories' do
			expect(::Category.where(parent_id: nil).distinct.pluck(:direction)).to match_array %w[inflow outflow]
		end

		it 'should give each parent category two subcategories' do
			expect(::Category.where(parent_id: nil).where.not(favourite: true).map { it.children.size }).to all(eq 2)
		end

		it 'should create exactly one favourite category' do
			expect(::Category.where(favourite: true).count).to eq 1
		end
	end

	describe 'securities' do
		let(:name) { :securities }

		it_behaves_like 'an e2e seed task'

		it 'should create 20 securities' do
			expect(::Security.count).to eq 20
		end

		it 'should create exactly one favourite security' do
			expect(::Security.where(favourite: true).count).to eq 1
		end

		it 'should create a purchase and a sale transaction' do
			expect(::Transaction.where(transaction_type: 'SecurityInvestment').count).to eq 2
		end
	end

	describe 'transactions' do
		let(:name) { :transactions }

		it_behaves_like 'an e2e seed task'

		it 'should create a transaction of every non-subtransaction type' do
			expect(::Transaction.distinct.pluck(:transaction_type)).to include(*%w[Basic Transfer Split LoanRepayment Payslip SecurityInvestment SecurityHolding SecurityTransfer Dividend])
		end

		it 'should date every transaction' do
			expect(::TransactionHeader.where(transaction_date: nil)).to be_empty
		end
	end

	describe 'schedules' do
		let(:name) { :schedules }

		it_behaves_like 'an e2e seed task'

		it 'should create a schedule of every non-subtransaction type' do
			scheduled = ::TransactionHeader.where.not(schedule_id: nil).filter_map { it.trx&.transaction_type }

			expect(scheduled).to include(*%w[Basic Transfer Split LoanRepayment Payslip SecurityInvestment SecurityHolding SecurityTransfer Dividend])
		end

		it 'should schedule every transaction for a future date' do
			expect(::Schedule.where(next_due_date: ..::Time.zone.today)).to be_empty
		end

		it 'should not date any scheduled transaction' do
			expect(::TransactionHeader.where.not(schedule_id: nil).where.not(transaction_date: nil)).to be_empty
		end
	end
end
