import type { Account } from "accounts/types";
import type { Mock } from "mocks/types";
import createAccount from "mocks/accounts/factories";

export default class AccountMockProvider implements Mock<Account> {
	// Mock account object
	public constructor(private readonly account: Account = createAccount({
		id: 1,
		name: "aa",
		closing_balance: 100,
		opening_balance: 100,
		cleared_closing_balance: 1.01,
		reconciled_closing_balance: 15.003
	})) {}

	public $get(): Account {
		// Return the mock account object
		return this.account;
	}
}

AccountMockProvider.$inject = [];