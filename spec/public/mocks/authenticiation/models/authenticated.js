(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("authenticationMocks");

	// Declare the authenticatedMock provider
	mod.provider("authenticatedMock", function() {
		var provider = this;

		// Mock authenticated status object
		provider.authenticated = true;

		provider.$get = function() {
			// Return the mock authenticated status object
			return provider.authenticated;
		};
	});
})();
