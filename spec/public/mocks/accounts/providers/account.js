(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccountsMocks")
		.provider("accountMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock account object
		provider.account = {id: 1, name: "aa", account_type: "bank", opening_balance: 100, status: "open"};

		provider.$get = function() {
			// Return the mock account object
			return provider.account;
		};
	}
})();
