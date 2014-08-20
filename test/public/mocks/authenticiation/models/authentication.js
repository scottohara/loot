(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("authenticationMocks");

	// Declare the authenticationModelMock provider
	mod.provider("authenticationModelMock", function($qMockProvider) {
		var provider = this,
				$q = $qMockProvider.$get();

		// Mock authenticationModel object
		provider.authenticationModel = {
			login: $q.promisify("gooduser", "baduser"),
			logout: sinon.stub(),
			isAuthenticated: true
		};

		provider.$get = function() {
			// Return the mock authenticationModel object
			return provider.authenticationModel;
		};
	});
})();
