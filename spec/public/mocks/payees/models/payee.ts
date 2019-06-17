import {
	PromiseMockConfig,
	QMock
} from "mocks/node-modules/angular/types";
import sinon, { SinonStub } from "sinon";
import { Mock } from "mocks/types";
import { Payee } from "payees/types";
import PayeeMockProvider from "mocks/payees/providers/payee";
import { PayeeModelMock } from "mocks/payees/types";
import PayeesMockProvider from "mocks/payees/providers/payees";
import QMockProvider from "mocks/node-modules/angular/services/q";

export default class PayeeModelMockProvider implements Mock<PayeeModelMock> {
	private readonly payeeModel: PayeeModelMock;

	public constructor(payeeMockProvider: PayeeMockProvider, payeesMockProvider: PayeesMockProvider, $qMockProvider: QMockProvider) {
		// Success/error = options for the stub promises
		const	$q: QMock = $qMockProvider.$get(),
					success: PromiseMockConfig<{data: Payee;}> = {
						args: { id: 1 },
						response: { data: payeeMockProvider.$get() }
					},
					error: PromiseMockConfig<void> = {
						args: { id: -1 }
					};

		// Mock payeeModel object
		this.payeeModel = {
			recent: "recent payees list",
			type: "payee",
			path(id: number): string {
				return `/payees/${id}`;
			},
			all: $q.promisify({ response: payeesMockProvider.$get() }),
			allList: $q.promisify({ response: payeesMockProvider.$get() }),
			find(id: number): SinonStub {
				// Get the matching payee
				const payee: Payee = payeesMockProvider.$get()[id - 1];

				// Return a promise-like object that resolves with the payee
				return $q.promisify({ response: payee })();
			},
			findLastTransaction: $q.promisify({ response: {} }, { args: -1 }),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			toggleFavourite(payee: Payee): SinonStub {
				return $q.promisify({ response: !payee.favourite })();
			},
			flush: sinon.stub(),
			addRecent: sinon.stub()
		};

		// Spy on find() and toggleFavourite()
		sinon.spy(this.payeeModel, "find");
		sinon.spy(this.payeeModel, "toggleFavourite");
	}

	public $get(): PayeeModelMock {
		// Return the mock payeeModel object
		return this.payeeModel;
	}
}

PayeeModelMockProvider.$inject = ["payeeMockProvider", "payeesMockProvider", "$qMockProvider"];