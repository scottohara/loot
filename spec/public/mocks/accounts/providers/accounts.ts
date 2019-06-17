import { Account } from "accounts/types";
import { Mock } from "mocks/types";
import createAccount from "mocks/accounts/factories";

export default class AccountsMockProvider implements Mock<Account[]> {
	// Mock accounts object
	public constructor(private readonly accounts: Account[] = [
		createAccount({ id: 1, name: "aa", closing_balance: 100, opening_balance: 100 }),
		createAccount({ id: 2, name: "bb", account_type: "investment" }),
		createAccount({ id: 3, name: "cc", num_transactions: 1 }),
		createAccount({ id: 4, name: "ba", account_type: "asset" }),
		createAccount({ id: 5, name: "ab", account_type: "asset" }),
		createAccount({ id: 6, name: "bc", account_type: "investment" }),
		createAccount({ id: 7, name: "ca" }),
		createAccount({ id: 8, name: "cb", account_type: "asset" }),
		createAccount({ id: 9, name: "ac" })
	]) {}

	public $get(): Account[] {
		// Return the mock accounts object
		return this.accounts;
	}
}

AccountsMockProvider.$inject = [];