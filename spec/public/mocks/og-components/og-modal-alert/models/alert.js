(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("alertMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock alert object
		provider.alert = {message: "alert message"};

		provider.$get = function() {
			// Return the mock alert object
			return provider.alert;
		};
	}
})();
