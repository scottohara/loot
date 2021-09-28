import type { Accounts } from "accounts/types";
import type { Mock } from "mocks/types";
import createAccount from "mocks/accounts/factories";

export default class AccountsWithBalancesMockProvider implements Mock<Accounts> {
	// Mock accounts object
	public constructor(private readonly accounts: Accounts = {
		"Bank accounts": {
			accounts: [
				createAccount({ id: 1, name: "aa", closing_balance: 30 }),
				createAccount({ id: 2, name: "bb", closing_balance: 30 }),
				createAccount({ id: 3, name: "cc", closing_balance: 30 }),
				createAccount({ id: 4, name: "ba", closing_balance: 10 })
			],
			total: 100
		},
		"Investment accounts": {
			accounts: [],
			total: 200
		},
		"Liability accounts": {
			accounts: [],
			total: -100
		}
	}) {}

	public $get(): Accounts {
		// Return the mock accounts object
		return this.accounts;
	}
}

AccountsWithBalancesMockProvider.$inject = [];