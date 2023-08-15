import type {
	BasicTransaction,
	TransactionBatch
} from "~/transactions/types";
import {
	startOfDay,
	subDays
} from "date-fns";
import type { Mock } from "~/mocks/types";
import { createBasicTransaction } from "~/mocks/transactions/factories";

function *transactions(count: number): Iterable<BasicTransaction> {
	for (let id = 1, daysAgo = count + 1; id < count + 1; id++, daysAgo--) {
		yield createBasicTransaction({
			id,
			amount: id,
			direction: 0 === id % 2 ? "inflow" : "outflow",
			transaction_date: subDays(startOfDay(new Date()), daysAgo),
			status: id < 5 ? "Cleared" : ""
		});
	}
}

export default class TransactionBatchMockProvider implements Mock<TransactionBatch> {
	private readonly transactionBatch: TransactionBatch;

	// Mock transactionBatch object
	public constructor() {
		this.transactionBatch = {
			openingBalance: 100,
			atEnd: true,
			transactions: [...transactions(9)]
		};
	}

	public $get(): TransactionBatch {
		// Return the mock transactionBatch object
		return this.transactionBatch;
	}
}

TransactionBatchMockProvider.$inject = [];