{
	/**
	 * Implementation
	 */
	class AccountMockProvider {
		constructor() {
			// Mock account object
			this.account = {id: 1, name: "aa", account_type: "bank", opening_balance: 100, status: "open"};
		}

		$get() {
			// Return the mock account object
			return this.account;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAccountsMocks")
		.provider("accountMock", AccountMockProvider);

	/**
	 * Dependencies
	 */
	AccountMockProvider.$inject = [];
}
