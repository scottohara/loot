class CashTransaction < Transaction
	validates :amount, :presence => true
end
