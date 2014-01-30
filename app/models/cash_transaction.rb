class CashTransaction < Transaction
	validates :amount, :presence => true
	validates :quantity, :commission, :absence => true
end
