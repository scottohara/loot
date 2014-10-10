require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Security, :type => :model do
	before :each do
		FactoryGirl.reload
	end

	it_behaves_like Transactable do
		let(:context_factory) { :security }
		let(:ledger_json_key) { :security }
		let(:expected_transactions_filter) { "" }
		let(:expected_closing_balances) { {:with_date => 1, :without_date => 0 } }
	end

	describe "#as_json" do
		subject { create(:security, name: "Test Security", code: "TEST", transactions: 1) }
		let(:json) { subject.as_json }

		it "should return a JSON representation" do
			expect(json).to include(:id => subject.id)
			expect(json).to include(:name => "Test Security")
			expect(json).to include(:code => "TEST")
			expect(json).to include(:closing_balance => subject.closing_balance)
			expect(json).to include(:num_transactions => 1)
		end
	end
end
