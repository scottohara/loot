(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccountsMocks")
		.provider("accountsMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock accounts object
		provider.accounts = [
			{id: 1, name: "aa"},
			{id: 2, name: "bb", account_type: "investment"},
			{id: 3, name: "cc"},
			{id: 4, name: "ba"},
			{id: 5, name: "ab"},
			{id: 6, name: "bc", account_type: "investment"},
			{id: 7, name: "ca"},
			{id: 8, name: "cb"},
			{id: 9, name: "ac"}
		];

		provider.$get = function() {
			// Return the mock accounts object
			return provider.accounts;
		};
	}
})();
