(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSecuritiesMocks")
		.provider("securityMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock security object
		provider.security = {id: 1, name: "aa", closing_balance: 1.006, current_holding: 1, unused: false};

		provider.$get = function() {
			// Return the mock security object
			return provider.security;
		};
	}
})();
