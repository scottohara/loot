{
	/**
	 * Implementation
	 */
	class TransactionMockProvider {
		constructor() {
			// Mock transaction object
			this.transaction = {
				id: 1,
				primary_account: {},
				transaction_date: moment().startOf("day").subtract(1, "day").toDate(),
				flag: "transaction flag"
			};
		}

		$get() {
			// Return the mock transaction object
			return this.transaction;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactionsMocks")
		.provider("transactionMock", TransactionMockProvider);

	/**
	 * Dependencies
	 */
	TransactionMockProvider.$inject = [];
}
