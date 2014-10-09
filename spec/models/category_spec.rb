require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Category, :type => :model do
	context "category" do
		it_behaves_like Transactable do
			let(:context_factory) { :category_with_children }
			let(:ledger_json_key) { :category }
			let(:expected_transactions_filter) { "" }
			let(:expected_closing_balances) { {:with_date => -1, :without_date => -2 } }
		end
	end

	context "subcategory" do
		it_behaves_like Transactable do
			let(:context_factory) { :subcategory }
			let(:ledger_json_key) { :subcategory }
			let(:expected_transactions_filter) { "" }
			let(:expected_closing_balances) { {:with_date => -1, :without_date => -2 } }
		end
	end
end
