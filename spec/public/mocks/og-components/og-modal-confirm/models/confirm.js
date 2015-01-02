(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponentsMocks");

	// Declare the confirmMock provider
	mod.provider("confirmMock", function() {
		var provider = this;

		// Mock confirm object
		provider.confirm = {message: "confirm message"};

		provider.$get = function() {
			// Return the mock confirm object
			return provider.confirm;
		};
	});
})();
