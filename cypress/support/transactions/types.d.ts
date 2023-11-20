export interface Subtransaction {
	categoryName: string;
	subcategoryOrAccountName: string;
	memo: string;
	amount: string;

	// These properties used for the edit form
	rawAmount?: string;
}

export interface Transaction {
	transactionDate: string;
	payeeOrSecurityName: string;
	categoryName: string;
	subcategoryOrAccountName?: string;
	subtransactions?: Subtransaction[];
	memo: string;
	creditAmount?: string;
	debitAmount?: string;
	price?: string;
	quantity?: string;
	commission?: string;
	balanceOrAmount?: string;
}

export interface TransactionEdit extends Transaction {
	rawTransactionDate?: string;
	payeeName?: string;
	securityName?: string;
	amount?: string;
	subcategoryName?: string;
	accountName?: string;
	quantity?: string;
	price?: string;
	commission?: string;
	memoFromInvestmentDetails?: boolean;
	type?: string;
	closingBalance?: string;
}

export interface TransactionsContext {
	id: string;
	heading: string;
	transactions: (Transaction | TransactionEdit)[];
	closingBalance?: string;
	cashAccountFor?: string;
}
