import {startOfDay, subDays} from "date-fns/esm";

export default class TransactionBatchMockProvider {
	constructor() {
		// Mock transactionBatch object
		this.transactionBatch = {
			openingBalance: 100,
			atEnd: true,
			transactions: [
				{id: 1, transaction_date: subDays(startOfDay(new Date()), 9), amount: 1, direction: "outflow", status: "Cleared"},
				{id: 2, transaction_date: subDays(startOfDay(new Date()), 8), amount: 2, direction: "inflow", payee: {id: 1}, status: "Cleared"},
				{id: 3, transaction_date: subDays(startOfDay(new Date()), 7), amount: 3, direction: "outflow", status: "Cleared"},
				{id: 4, transaction_date: subDays(startOfDay(new Date()), 6), amount: 4, direction: "inflow", status: "Cleared"},
				{id: 5, transaction_date: subDays(startOfDay(new Date()), 5), amount: 5, direction: "outflow"},
				{id: 6, transaction_date: subDays(startOfDay(new Date()), 4), amount: 6, direction: "inflow"},
				{id: 7, transaction_date: subDays(startOfDay(new Date()), 3), amount: 7, direction: "outflow"},
				{id: 8, transaction_date: subDays(startOfDay(new Date()), 2), amount: 8, direction: "inflow"},
				{id: 9, transaction_date: subDays(startOfDay(new Date()), 1), amount: 9, direction: "outflow"}
			]
		};
	}

	$get() {
		// Return the mock transactionBatch object
		return this.transactionBatch;
	}
}

TransactionBatchMockProvider.$inject = [];