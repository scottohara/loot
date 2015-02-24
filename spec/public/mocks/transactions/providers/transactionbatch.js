(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootTransactionsMocks")
		.provider("transactionBatchMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock transactionBatch object
		provider.transactionBatch = {
			openingBalance: 100,
			atEnd: true,
			transactions: [
				{id: 1, transaction_date: moment().startOf("day").subtract(9, "days").toDate(), amount: 1, direction: "outflow", status: "Cleared"},
				{id: 2, transaction_date: moment().startOf("day").subtract(8, "days").toDate(), amount: 2, direction: "inflow", payee: {id: 1}, status: "Cleared"},
				{id: 3, transaction_date: moment().startOf("day").subtract(7, "days").toDate(), amount: 3, direction: "outflow",status: "Cleared"},
				{id: 4, transaction_date: moment().startOf("day").subtract(6, "days").toDate(), amount: 4, direction: "inflow", status: "Cleared"},
				{id: 5, transaction_date: moment().startOf("day").subtract(5, "days").toDate(), amount: 5, direction: "outflow"},
				{id: 6, transaction_date: moment().startOf("day").subtract(4, "days").toDate(), amount: 6, direction: "inflow"},
				{id: 7, transaction_date: moment().startOf("day").subtract(3, "days").toDate(), amount: 7, direction: "outflow"},
				{id: 8, transaction_date: moment().startOf("day").subtract(2, "days").toDate(), amount: 8, direction: "inflow"},
				{id: 9, transaction_date: moment().startOf("day").subtract(1, "day").toDate(), amount: 9, direction: "outflow"}
			]
		};

		provider.$get = function() {
			// Return the mock transactionBatch object
			return provider.transactionBatch;
		};
	}
})();
