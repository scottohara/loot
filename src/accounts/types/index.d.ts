import {Entity} from "loot/types";

export type StoredAccountType =	"asset" | "bank" | "cash" | "credit" | "investment" | "liability" | "loan";

export type DisplayAccountType =	"Asset" | "Bank" | "Cash" | "Credit" | "Investment" | "Liability" | "Loan";

export type AccountType =	StoredAccountType | DisplayAccountType;

export type StoredAccountStatus = "open" | "closed";

export type DisplayAccountStatus = "Open" | "Closed";

export type AccountStatus = StoredAccountStatus | DisplayAccountStatus;

interface InvestmentRelatedAccount {
	opening_balance: number;
}

export interface Account extends Entity {
	account_type: AccountType;
	status: AccountStatus;
	favourite: boolean;
	related_account: Account | InvestmentRelatedAccount | null;
	opening_balance: number;
	num_transactions: number;
}

export interface Accounts {
	[account_type: string]: {
		accounts: Account[];
		total: number;
	};
}