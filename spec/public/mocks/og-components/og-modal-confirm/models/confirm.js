(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("confirmMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock confirm object
		provider.confirm = {message: "confirm message"};

		provider.$get = function() {
			// Return the mock confirm object
			return provider.confirm;
		};
	}
})();
