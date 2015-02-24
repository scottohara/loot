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
			"bank": {total: 100},
			"investment": {total: 200},
			"liability": {total: -100}
		};

		provider.$get = function() {
			// Return the mock accounts object
			return provider.accounts;
		};
	}
})();
