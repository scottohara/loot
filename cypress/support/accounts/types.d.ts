export interface Account {
	name: string;
	closingBalance: string;
	favourite?: boolean;
}

export interface AccountType {
	heading: string;
	accounts: Account[];
	total: string;
}
