import {
	Account,
	AccountStatus,
	AccountType
} from "accounts/types";

let id: number = 1;

export default function createAccount(props: Partial<Account> = {}): Account {
	id++;

	return Object.assign({
		id,
		name: `Account ${id}`,
		closing_balance: 0,
		account_type: "bank" as AccountType,
		status: "open" as AccountStatus,
		favourite: false,
		related_account: null,
		opening_balance: 0,
		num_transactions: 0
	}, props);
}