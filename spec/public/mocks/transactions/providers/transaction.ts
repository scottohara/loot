import type { BasicTransaction } from "transactions/types";
import type { Mock } from "mocks/types";
import { createBasicTransaction } from "mocks/transactions/factories";

export default class TransactionMockProvider implements Mock<BasicTransaction> {
	// Mock transaction object
	public constructor(private readonly transaction: BasicTransaction = createBasicTransaction({ id: 1, flag: "transaction flag" })) {}

	public $get(): BasicTransaction {
		// Return the mock transaction object
		return this.transaction;
	}
}

TransactionMockProvider.$inject = [];