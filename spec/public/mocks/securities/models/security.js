(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("securitiesMocks");

	// Declare the securityMock provider
	mod.provider("securityMock", function() {
		var provider = this;

		// Mock security object
		provider.security = {id: 1, name: "aa", closing_balance: 1.006, current_holding: 1, unused: false};

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
			{id: 1, name: "aa", closing_balance: 1.006, current_holding: 1, unused: false},
			{id: 2, name: "bb", closing_balance: 2, current_holding: 1, unused: false},
			{id: 3, name: "cc", closing_balance: 3, current_holding: 1, num_transactions: 2, unused: false},
			{id: 4, name: "ba", closing_balance: 4, current_holding: 1, unused: false},
			{id: 5, name: "ab", closing_balance: 5, current_holding: 1, unused: false},
			{id: 6, name: "bc", closing_balance: 6, current_holding: 0, unused: false},
			{id: 7, name: "ca", closing_balance: 7, current_holding: 0, unused: true},
			{id: 8, name: "cb", closing_balance: 8, current_holding: 0, unused: false},
			{id: 9, name: "ac", closing_balance: 9, current_holding: 0, unused: true}
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
	});
})();
