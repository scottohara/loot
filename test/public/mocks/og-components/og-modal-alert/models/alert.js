(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponentsMocks");

	// Declare the alertMock provider
	mod.provider("alertMock", function() {
		var provider = this;

		// Mock alert object
		provider.alert = {message: "alert message"};

		provider.$get = function() {
			// Return the mock alert object
			return provider.alert;
		};
	});
})();
