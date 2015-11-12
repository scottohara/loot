{
	/**
	 * Implementation
	 */
	class SecuritiesMockProvider {
		constructor() {
			// Mock securities object
			this.securities = [
				{id: 1, name: "aa", closing_balance: 1.006, current_holding: 1, unused: false},
				{id: 2, name: "bb", closing_balance: 2, current_holding: 1, unused: false},
				{id: 3, name: "cc", closing_balance: 3, current_holding: 1, num_transactions: 2, unused: false},
				{id: 4, name: "ba", closing_balance: 4, current_holding: 1, unused: false},
				{id: 5, name: "ab", closing_balance: 5, current_holding: 1, unused: false},
				{id: 6, name: "bc", closing_balance: 6, current_holding: 0, unused: false},
				{id: 7, name: "ca", closing_balance: 7, current_holding: 0, unused: true},
				{id: 8, name: "cb", closing_balance: 8, current_holding: 0, unused: false},
				{id: 9, name: "ac", closing_balance: 9, current_holding: 0, unused: true}
			];
		}

		$get() {
			// Return the mock securities object
			return this.securities;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSecuritiesMocks")
		.provider("securitiesMock", SecuritiesMockProvider);

	/**
	 * Dependencies
	 */
	SecuritiesMockProvider.$inject = [];
}
