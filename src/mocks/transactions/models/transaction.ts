import type {
	PromiseMockConfig,
	QMock,
} from "~/mocks/node-modules/angular/types";
import {
	createSubtransaction,
	createSubtransferTransaction,
} from "~/mocks/transactions/factories";
import type { BasicTransaction } from "~/transactions/types";
import type { Mock } from "~/mocks/types";
import type QMockProvider from "~/mocks/node-modules/angular/services/q";
import type TransactionBatchMockProvider from "~/mocks/transactions/providers/transactionbatch";
import type TransactionMockProvider from "~/mocks/transactions/providers/transaction";
import type { TransactionModelMock } from "~/mocks/transactions/types";
import sinon from "sinon";
import { startOfDay } from "date-fns";

export default class TransactionModelMockProvider
	implements Mock<TransactionModelMock>
{
	private readonly transactionModel: TransactionModelMock;

	public constructor(
		transactionMockProvider: TransactionMockProvider,
		transactionBatchMockProvider: TransactionBatchMockProvider,
		$qMockProvider: QMockProvider,
	) {
		// Success/error = options for the stub promises
		const $q: QMock = $qMockProvider.$get(),
			success: PromiseMockConfig<BasicTransaction> = {
				args: { id: 1 },
				response: transactionMockProvider.$get(),
			},
			error: PromiseMockConfig<void> = {
				args: { id: -1 },
			};

		// Mock transactionModel object
		this.transactionModel = {
			all: $q.promisify(
				{
					args: "/1",
					response: transactionBatchMockProvider.$get(),
				},
				{
					args: "/-1",
				},
			),
			query: $q.promisify(
				{
					args: "search",
					response: transactionBatchMockProvider.$get(),
				},
				{
					args: "dontsearch",
				},
			),
			findSubtransactions: $q.promisify(
				{
					response: [
						createSubtransferTransaction({ id: 1 }),
						createSubtransaction({ id: 2 }),
						createSubtransaction({ id: 3 }),
					],
				},
				{
					args: -1,
				},
			),
			find: $q.promisify({
				response: transactionMockProvider.$get(),
			}),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			updateStatus: $q.promisify(),
			flag: $q.promisify(success, error),
			unflag: $q.promisify(1, -1),
			allDetailsShown: sinon.stub().returns(true),
			showAllDetails: sinon.stub(),
			lastTransactionDate: startOfDay(new Date()),
		};
	}

	public $get(): TransactionModelMock {
		// Return the mock transactionModel object
		return this.transactionModel;
	}
}

TransactionModelMockProvider.$inject = [
	"transactionMockProvider",
	"transactionBatchMockProvider",
	"$qMockProvider",
];
