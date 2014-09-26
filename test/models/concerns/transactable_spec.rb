class Module
	include Minitest::Spec::DSL
end

module TransactableSpec
	module ClassMethods
		def ledger_specs
			before do
				@opening_balance, @transactions, @at_end = subject.ledger({})
			end

			it "should return an opening balance" do
				@opening_balance.must_equal expected_opening_balance
			end

			describe "previous direction" do
				describe "reached the start" do
					it "should set the opening balance to be the parent context's opening balance" do
						@opening_balance.must_equal expected_opening_balance
					end
				end
			end

			it "should return a set of transactions" do
				@transactions.wont_be_nil
			end

			it "should only include transactions that match the parent context" do
				@transactions.reject{|trx| trx[context_key][:id] == subject[:id]}.length.must_equal 0
			end

			it "should return a flag indicating if we have reached the end" do
				@at_end.must_equal expected_at_end
			end
		end
	end
end
