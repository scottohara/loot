import {startOfDay, subDays} from "date-fns/esm";

export default class TransactionMockProvider {
	constructor() {
		// Mock transaction object
		this.transaction = {
			id: 1,
			primary_account: {},
			transaction_date: subDays(startOfDay(new Date()), 1),
			flag: "transaction flag"
		};
	}

	$get() {
		// Return the mock transaction object
		return this.transaction;
	}
}

TransactionMockProvider.$inject = [];