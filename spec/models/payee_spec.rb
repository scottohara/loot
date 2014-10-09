require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Payee, :type => :model do
	it_behaves_like Transactable do
		let(:context_factory) { :payee }
		let(:ledger_json_key) { :payee }
		let(:expected_transactions_filter) { "transactions.transaction_type != 'Subtransfer'" }
		let(:expected_closing_balances) { {:with_date => -1, :without_date => 0 } }
	end
end
