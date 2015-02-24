(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootTransactionsMocks")
		.provider("transactionMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock transaction object
		provider.transaction = {
			id: 1,
			primary_account: {},
			transaction_date: moment().startOf("day").subtract(1, "day").toDate(),
			flag: "transaction flag"
		};

		provider.$get = function() {
			// Return the mock transaction object
			return provider.transaction;
		};
	}
})();
