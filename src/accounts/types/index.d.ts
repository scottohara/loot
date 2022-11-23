import type { Entity } from "loot/types";

export type StoredAccountType =	"asset" | "bank" | "cash" | "credit" | "investment" | "liability" | "loan";

export type DisplayAccountType =	"Asset" | "Bank" | "Cash" | "Credit" | "Investment" | "Liability" | "Loan";

export type AccountType =	DisplayAccountType | StoredAccountType;

export type StoredAccountStatus = "closed" | "open";

export type DisplayAccountStatus = "Closed" | "Open";

export type AccountStatus = DisplayAccountStatus | StoredAccountStatus;

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
	reconciled_closing_balance: number;
}

export type Accounts = Record<string, {
	accounts: Account[];
	total: number;
}>;