(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSecuritiesMocks")
		.provider("securityModelMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["securityMockProvider", "securitiesMockProvider", "$qMockProvider"];

	/**
	 * Implementation
	 */
	function Provider(securityMockProvider, securitiesMockProvider, $qMockProvider) {
		var provider = this,
				success,
				error,
				$q = $qMockProvider.$get();

		// Options for the stub promises
		success = {
			args: {id: 1},
			response: {data: securityMockProvider.$get()}
		};
		
		error = {
			args: {id: -1}
		};

		// Mock securityModel object
		provider.securityModel = {
			path: function(id) {
				return "/securities/" + id;
			},
			recent: "recent securities list",
			all: $q.promisify({
				response: securitiesMockProvider.$get()
			}),
			allWithBalances: sinon.stub().returns(securitiesMockProvider.$get()),
			find: function(id) {
				// Get the matching security
				var security = securitiesMockProvider.$get()[id - 1];

				// Return a promise-like object that resolves with the security
				return $q.promisify({response: security})();
			},
			findLastTransaction: $q.promisify({
				response: {}
			}, {
				args: -1
			}),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			flush: sinon.stub(),
			addRecent: sinon.stub()
		};

		// Spy on find()
		sinon.spy(provider.securityModel, "find");

		provider.$get = function() {
			// Return the mock securityModel object
			return provider.securityModel;
		};
	}
})();
