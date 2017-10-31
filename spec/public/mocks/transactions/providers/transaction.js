import moment from "moment";

export default class TransactionMockProvider {
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

TransactionMockProvider.$inject = [];