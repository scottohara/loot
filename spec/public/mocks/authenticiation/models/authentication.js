(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAuthenticationMocks")
		.provider("authenticationModelMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["$qMockProvider"];

	/**
	 * Implementation
	 */
	function Provider($qMockProvider) {
		var provider = this,
				$q = $qMockProvider.$get();

		// Mock authenticationModel object
		provider.authenticationModel = {
			login: $q.promisify("gooduser", "baduser"),
			logout: sinon.stub(),
			isAuthenticated: sinon.stub().returns(true)
		};

		provider.$get = function() {
			// Return the mock authenticationModel object
			return provider.authenticationModel;
		};
	}
})();
