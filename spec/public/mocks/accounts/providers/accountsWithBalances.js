(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccountsMocks")
		.provider("accountsWithBalancesMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock accounts object
		provider.accounts = {
			"Bank accounts": {
				accounts: [
					{id: 1, name: "aa", account_type: "bank", closing_balance: 30},
					{id: 2, name: "bb", account_type: "bank", closing_balance: 30},
					{id: 3, name: "cc", account_type: "bank", closing_balance: 30},
					{id: 4, name: "ba", account_type: "bank", closing_balance: 10}
				],
				total: 100
			},
			"Investment accounts": {
				accounts: [],
				total: 200
			},
			"Liability accounts": {
				total: -100
			}
		};

		provider.$get = function() {
			// Return the mock accounts object
			return provider.accounts;
		};
	}
})();
