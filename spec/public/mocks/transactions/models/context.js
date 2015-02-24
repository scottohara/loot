(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootTransactionsMocks")
		.provider("contextModelMock", Provider);

	/**
	 * Implementation
	 */
	function Provider(payeeModelMockProvider) {
		var provider = this;
		
		provider.$get = function() {
			// Return the mock payeeModel object
			return payeeModelMockProvider.$get();
		};
	}
})();
