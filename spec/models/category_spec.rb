require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Category, :type => :model do
	context "category" do
		it_behaves_like Transactable do
			let(:context_factory) { :category }
			let(:ledger_json_key) { :category }
		end
	end

=begin
	describe "ledger" do
		context "parent category" do
			it "should handle all types of transactions", :spec_type => :category_type do
				@account = create(:category, :with_all_transaction_types)
			end

			it "should only include transactions belonging to the category" do
				let(:category) { create(:category, transactions: 2) }

				# Another category with transactions
				create(:category, transactions: 2)
				create(:subcategory, transactions: 1, parent: category)

				_, transactions, _ = category.ledger

				expect(transactions.size).to eq 3
				expect(transactions).to all_belong_to(category)
			end
		end

		context "subcategory" do
			it "should handle all types of transactions", :spec_type => :category_type do
				@account = create(:subcategory, :with_all_transaction_types)
			end

			it "should only include transactions belonging to the subcategory" do
				let(:category) { create(:subcategory, transactions: 2) }

				# Another category & subcategory with transactions
				create(:category, transactions: 2)
				create(:subcategory, transactions: 2)

				_, transactions, _ = category.ledger

				expect(transactions.size).to eq 2
				expect(transactions).to all_belong_to(category)
			end
		end

		after :each, :spec_type => :category_type do
			_, transactions, _ = @category.ledger

			expect(transactions).to match_ledger_transactions(@category.transactions)
		end
	end

=end

end
