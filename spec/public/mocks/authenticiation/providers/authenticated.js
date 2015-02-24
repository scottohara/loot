(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAuthenticationMocks")
		.provider("authenticatedMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock authenticated status object
		provider.authenticated = true;

		provider.$get = function() {
			// Return the mock authenticated status object
			return provider.authenticated;
		};
	}
})();
