require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Payee, :type => :model do
	it_behaves_like Transactable do
		let(:context_factory) { :payee }
		let(:ledger_json_key) { :payee }
		let(:expected_transactions_filter) { "transactions.transaction_type != 'Subtransfer'" }
		let(:expected_closing_balances) { {:with_date => -1, :without_date => 0 } }
	end

	describe "#opening_balance" do
		subject { create(:payee) }

		it "should return zero" do
			expect(subject.opening_balance).to eq 0
		end
	end

	describe "#account_type" do
		subject { create(:payee) }
		
		it "should return nil" do
			expect(subject.account_type).to be_nil
		end
	end

	describe "#as_json" do
		subject { create(:payee, name: "Test Payee", transactions: 1) }
		let(:json) { subject.as_json }

		it "should return a JSON representation" do
			expect(json).to include(:id => subject.id)
			expect(json).to include(:name => "Test Payee")
			expect(json).to include(:closing_balance => subject.closing_balance)
			expect(json).to include(:num_transactions => 1)
		end
	end
end
