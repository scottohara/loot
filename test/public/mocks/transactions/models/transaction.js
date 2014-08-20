(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("transactionsMocks");

	// Declare the transactionMock provider
	mod.provider("transactionMock", function() {
		var provider = this;

		// Mock transaction object
		provider.transaction = {
			id: 1,
			primary_account: {},
			flag: "transaction flag"
		};

		provider.$get = function() {
			// Return the mock transaction object
			return provider.transaction;
		};
	});

	// Declare the transactionModelMock provider
	mod.provider("transactionModelMock", function(transactionMockProvider, $qMockProvider) {
		var provider = this,
				success,
				error,
				$q = $qMockProvider.$get();

		// Options for the stub promises
		success = {
			args: {id: 1},
			response: {data: transactionMockProvider.$get()}
		};
		
		error = {
			args: {id: -1}
		};

		// Mock transactionModel object
		provider.transactionModel = {
			findSubtransactions: $q.promisify({
				response: [
					{id: 1, transaction_type: "Transfer", account: "subtransfer account"},
					{id: 2, category: "subtransaction category"},
					{id: 3, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
				]
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
	});
})();
