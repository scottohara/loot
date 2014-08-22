(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("payeesMocks");

	// Declare the payeeMock provider
	mod.provider("payeeMock", function() {
		var provider = this;

		// Mock payee object
		provider.payee = {id: 1};

		provider.$get = function() {
			// Return the mock payee object
			return provider.payee;
		};
	});

	// Declare the payeesMock provider
	mod.provider("payeesMock", function() {
		var provider = this;

		// Mock payees object
		provider.payees = [
			{id: 1, name: "aa"},
			{id: 2, name: "bb"},
			{id: 3, name: "cc", num_transactions: 2},
			{id: 4, name: "ba"},
			{id: 5, name: "ab"},
			{id: 6, name: "bc"},
			{id: 7, name: "ca"},
			{id: 8, name: "cb"},
			{id: 9, name: "ac"}
		];

		provider.$get = function() {
			// Return the mock payees object
			return provider.payees;
		};
	});

	// Declare the payeeModelMock provider
	mod.provider("payeeModelMock", function(payeeMockProvider, payeesMockProvider, $qMockProvider) {
		var provider = this,
				success,
				error,
				$q = $qMockProvider.$get();

		// Options for the stub promises
		success = {
			args: {id: 1},
			response: {data: payeeMockProvider.$get()}
		};
		
		error = {
			args: {id: -1}
		};
		// Mock payeeModel object
		provider.payeeModel = {
			recent: "recent payees list",
			all: $q.promisify({
				response: payeesMockProvider.$get()
			}),
			find: function(id) {
				// Get the matching payee
				var payee = payeesMockProvider.$get()[id - 1];

				// Return a promise-like object that resolves with the payee
				return $q.promisify({response: payee})();
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
		sinon.spy(provider.payeeModel, "find");

		provider.$get = function() {
			// Return the mock payeeModel object
			return provider.payeeModel;
		};
	});
})();
