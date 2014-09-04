(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("securitiesMocks");

	// Declare the securityMock provider
	mod.provider("securityMock", function() {
		var provider = this;

		// Mock security object
		provider.security = {id: 1, name: "aa", current_value: 1.006, current_holding: 1};

		provider.$get = function() {
			// Return the mock security object
			return provider.security;
		};
	});

	// Declare the securitiesMock provider
	mod.provider("securitiesMock", function() {
		var provider = this;

		// Mock securities object
		provider.securities = [
			{id: 1, name: "aa", current_value: 1.006, current_holding: 1},
			{id: 2, name: "bb", current_value: 2, current_holding: 1},
			{id: 3, name: "cc", current_value: 3, current_holding: 1, num_transactions: 2},
			{id: 4, name: "ba", current_value: 4, current_holding: 1},
			{id: 5, name: "ab", current_value: 5, current_holding: 1},
			{id: 6, name: "bc", current_value: 6, current_holding: 0},
			{id: 7, name: "ca", current_value: 7, current_holding: 0},
			{id: 8, name: "cb", current_value: 8, current_holding: 0},
			{id: 9, name: "ac", current_value: 9, current_holding: 0}
		];

		provider.$get = function() {
			// Return the mock securities object
			return provider.securities;
		};
	});

	// Declare the securityModelMock provider
	mod.provider("securityModelMock", function(securityMockProvider, securitiesMockProvider, $qMockProvider) {
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
	});
})();
