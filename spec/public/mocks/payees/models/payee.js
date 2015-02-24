(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootPayeesMocks")
		.provider("payeeModelMock", Provider);

	/**
	 * Implementation
	 */
	function Provider(payeeMockProvider, payeesMockProvider, $qMockProvider) {
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
			type: sinon.stub().returns("payee"),
			path: function(id) {
				return "/payees/" + id;
			},
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
			}, {
				args: -1
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
	}
})();
