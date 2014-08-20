(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("securitiesMocks");

	// Declare the securityMock provider
	mod.provider("securityMock", function() {
		var provider = this;

		// Mock security object
		provider.security = {id: 1};

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
			{id: 1, name: "aa"},
			{id: 2, name: "bb"},
			{id: 3, name: "cc"},
			{id: 4, name: "ba"},
			{id: 5, name: "ab"},
			{id: 6, name: "bc"},
			{id: 7, name: "ca"},
			{id: 8, name: "cb"},
			{id: 9, name: "ac"}
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
			recent: "recent securities list",
			all: $q.promisify({
				response: securitiesMockProvider.$get()
			}),
			findLastTransaction: $q.promisify({
				response: {}
			}),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			flush: sinon.stub(),
			addRecent: sinon.stub()
		};

		provider.$get = function() {
			// Return the mock securityModel object
			return provider.securityModel;
		};
	});
})();
