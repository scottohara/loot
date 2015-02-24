(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootPayeesMocks")
		.provider("payeeMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock payee object
		provider.payee = {id: 1, name: "aa"};

		provider.$get = function() {
			// Return the mock payee object
			return provider.payee;
		};
	}
})();
