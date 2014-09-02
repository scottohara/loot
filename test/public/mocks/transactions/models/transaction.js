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

	// Declare the transactionBatchMock provider
	mod.provider("transactionBatchMock", function() {
		var provider = this;

		// Mock transactionBatch object
		provider.transactionBatch = {
			openingBalance: 100,
			atEnd: true,
			transactions: [
				{id: 1, transaction_date: moment().subtract("days", 9).format("YYYY-MM-DD"), amount: 1, direction: "outflow"},
				{id: 2, transaction_date: moment().subtract("days", 8).format("YYYY-MM-DD"), amount: 2, direction: "inflow", payee: {id: 1}},
				{id: 3, transaction_date: moment().subtract("days", 7).format("YYYY-MM-DD"), amount: 3, direction: "outflow"},
				{id: 4, transaction_date: moment().subtract("days", 6).format("YYYY-MM-DD"), amount: 4, direction: "inflow"},
				{id: 5, transaction_date: moment().subtract("days", 5).format("YYYY-MM-DD"), amount: 5, direction: "outflow"},
				{id: 6, transaction_date: moment().subtract("days", 4).format("YYYY-MM-DD"), amount: 6, direction: "inflow"},
				{id: 7, transaction_date: moment().subtract("days", 3).format("YYYY-MM-DD"), amount: 7, direction: "outflow"},
				{id: 8, transaction_date: moment().subtract("days", 2).format("YYYY-MM-DD"), amount: 8, direction: "inflow"},
				{id: 9, transaction_date: moment().subtract("days", 1).format("YYYY-MM-DD"), amount: 9, direction: "outflow"}
			]
		};

		provider.$get = function() {
			// Return the mock transactionBatch object
			return provider.transactionBatch;
		};
	});

	// Declare the transactionModelMock provider
	mod.provider("transactionModelMock", function(transactionMockProvider, transactionBatchMockProvider, $qMockProvider) {
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
			all: $q.promisify({
				args: "/payees/1",
				response: transactionBatchMockProvider.$get()
			}, {
				args: "/payees/-1"
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
