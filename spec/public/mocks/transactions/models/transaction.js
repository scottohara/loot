(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootTransactionsMocks")
		.provider("transactionModelMock", Provider);

	/**
	 * Implementation
	 */
	function Provider(transactionMockProvider, transactionBatchMockProvider, $qMockProvider) {
		var provider = this,
				success,
				error,
				$q = $qMockProvider.$get();

		// Options for the stub promises
		success = {
			args: {id: 1},
			response: transactionMockProvider.$get()
		};
		
		error = {
			args: {id: -1}
		};

		// Mock transactionModel object
		provider.transactionModel = {
			all: $q.promisify({
				args: "/1",
				response: transactionBatchMockProvider.$get()
			}, {
				args: "/-1"
			}),
			query: $q.promisify({
				args: "search",
				response: transactionBatchMockProvider.$get()
			}, {
				args: "dontsearch"
			}),
			findSubtransactions: $q.promisify({
				response: [
					{id: 1, transaction_type: "Transfer", account: "subtransfer account"},
					{id: 2, category: "subtransaction category"},
					{id: 3, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
				]
			}, {
				args: -1
			}),
			find: $q.promisify({
				response: transactionMockProvider.$get()
			}),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			updateStatus: $q.promisify(),
			flag: $q.promisify(success, error),
			unflag: $q.promisify(1, -1)
		};

		provider.$get = function() {
			// Return the mock transactionModel object
			return provider.transactionModel;
		};
	}
})();
