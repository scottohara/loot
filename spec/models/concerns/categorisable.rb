RSpec.shared_examples Categorisable do
	describe "::transaction_category" do
		subject { described_class }
		let(:trx) { {} }
		let(:account) { {type: "cash"} }
		let(:expected) { {} }

		context "basic types" do
			it "should handle a Basic transaction" do
				trx['transaction_type'] = "Basic"
			end

			it "should handle a Sub transaction" do
				trx['transaction_type'] = "Sub"
			end

			after :each do
				expect(subject).to receive(:basic_category).with(trx).and_return ["basic", "basic"]
				expected[:id] = "basic"
				expected[:name] = "basic"
			end
		end

		context "transfer types" do
			it "should handle a Transfer transaction" do
				trx['transaction_type'] = "Transfer"
			end

			it "should handle a Subtransfer transaction" do
				trx['transaction_type'] = "Subtransfer"
			end

			it "should handle a SecurityTransfer transaction" do
				trx['transaction_type'] = "SecurityTransfer"
			end

			after :each do
				trx['direction'] = 'outflow'
				trx['parent_transaction_type'] = 'parent_type'

				expect(subject).to receive(:psuedo_category).with("Transfer", trx['direction'], trx['parent_transaction_type']).and_return ["transfer", "transfer"]
				expected[:id] = "transfer"
				expected[:name] = "transfer"
			end
		end

		context "splits and dividends" do
			it "should handle a Split transaction" do
				trx['transaction_type'] = "Split"
			end

			it "should handle a Dividend transaction" do
				trx['transaction_type'] = "Dividend"
			end

			after :each do
				trx['direction'] = 'outflow'

				expect(subject).to receive(:psuedo_category).with(*trx.values).and_return ["split", "split"]
				expected[:id] = "split"
				expected[:name] = "split"
			end
		end

		context "loan repayments" do
			it "should handle a LoanRepayment transaction" do
				trx['transaction_type'] = "LoanRepayment"
				
				expected[:id] = trx['transaction_type']
				expected[:name] = "Loan Repayment"
			end
		end

		context "security holdings" do
			it "should handle an outflow SecurityHolding transaction" do
				trx['transaction_type'] = "SecurityHolding"
				trx['direction'] = "outflow"

				expected[:id] = "RemoveShares"
				expected[:name] = "Remove Shares"
			end

			it "should handle an inflow SecurityHolding transaction" do
				trx['transaction_type'] = "SecurityHolding"
				trx['direction'] = "inflow"

				expected[:id] = "AddShares"
				expected[:name] = "Add Shares"
			end
		end

		context "security investments" do
			context "for investment accounts" do
				it "should handle an outflow SecurityInvestment transaction" do
					trx['transaction_type'] = "SecurityInvestment"
					trx['direction'] = "outflow"
					account[:type] = "investment"

					expected[:id] = "Sell"
					expected[:name] = "Sell"
				end

				it "should handle an inflow SecurityInvestment transaction" do
					trx['transaction_type'] = "SecurityInvestment"
					trx['direction'] = "inflow"
					account[:type] = "investment"

					expected[:id] = "Buy"
					expected[:name] = "Buy"
				end
			end

			context "for cash accounts" do
				it "should be treated as a transfer" do
					trx['transaction_type'] = "SecurityInvestment"
					trx['direction'] = 'outflow'
					account[:type] = "cash"

					expect(subject).to receive(:psuedo_category).with("Transfer", trx['direction']).and_return ["transfer", "transfer"]
					expected[:id] = "transfer"
					expected[:name] = "transfer"
				end
			end
		end

		context "anything else" do
			it "should be return the transaction type" do
				trx['transaction_type'] = "Unknown"

				expected[:id] = trx['transaction_type']
				expected[:name] = trx['transaction_type']
			end
		end

		after :each do
			actual = subject.transaction_category trx, account[:type]

			expect(actual[:id]).to eq expected[:id]
			expect(actual[:name]).to eql expected[:name]
		end
	end

	describe "::basic_category" do
		subject { described_class }
		let(:trx) { {'category_id' => 1, 'category_name' => "name"} }

		context "category" do
			it "should return the category details" do
				id, name = subject.basic_category trx

				expect(id).to eq trx['category_id'].to_s
				expect(name).to eq trx['category_name']
			end
		end

		context "subcategory" do
			it "should return the parent category details" do
				trx['parent_category_id'] = 2
				trx['parent_category_name'] = "parent_name"

				id, name = subject.basic_category trx

				expect(id).to eq trx['parent_category_id'].to_s
				expect(name).to eq trx['parent_category_name']
			end
		end
	end

	describe "::basic_subcategory" do
		subject { described_class }
		let(:trx) { {'category_id' => 1, 'category_name' => "name"} }

		context "category" do
			it "should be nil" do
				expect(subject.basic_subcategory(trx)).to be_nil
			end
		end

		context "subcategory" do
			it "should not be nil" do
				trx['parent_category_id'] = "parent_id"

				result = subject.basic_subcategory trx

				expect(result[:id]).to eq trx['category_id'].to_s
				expect(result[:name]).to eq trx['category_name']
				expect(result[:parent_id]).to eq trx['parent_category_id']
			end
		end
	end

	describe "::psuedo_category" do
		subject { described_class }

		context "outflow" do
			it "should append the suffix 'To'" do
				id, name = subject.psuedo_category "Test", "outflow"
				expect(id).to eq "TestTo"
				expect(name).to eq "Test To"
			end
		end

		context "inflow" do
			it "should append the suffix 'From'" do
				id, name = subject.psuedo_category "Test", "inflow"
				expect(id).to eq "TestFrom"
				expect(name).to eq "Test From"
			end
		end

		context "Payslip" do
			it "should be treated as an outflow" do
				id, name = subject.psuedo_category "Test", nil, "Payslip"
				expect(id).to eq "TestTo"
				expect(name).to eq "Test To"
			end
		end
	end
end
