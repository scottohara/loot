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
end
