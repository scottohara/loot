(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootTransactionsMocks")
		.provider("contextMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["payeeMockProvider"];

	/**
	 * Implementation
	 */
	function Provider(payeeMockProvider) {
		var provider = this;

		provider.$get = function() {
			// Return the mock payee object
			return payeeMockProvider.$get();
		};
	}
})();
