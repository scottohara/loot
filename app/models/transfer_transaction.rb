# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Transfer transaction
class TransferTransaction < PayeeCashTransaction
	include ::Transferable

	after_initialize do |t|
		t.transaction_type = 'Transfer'
	end
end
