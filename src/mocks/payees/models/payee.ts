import type {
	PromiseMockConfig,
	QMock,
} from "~/mocks/node-modules/angular/types";
import sinon, { type SinonStub } from "sinon";
import type { Mock } from "~/mocks/types";
import type { Payee } from "~/payees/types";
import type PayeeMockProvider from "~/mocks/payees/providers/payee";
import type { PayeeModelMock } from "~/mocks/payees/types";
import type PayeesMockProvider from "~/mocks/payees/providers/payees";
import type QMockProvider from "~/mocks/node-modules/angular/services/q";

export default class PayeeModelMockProvider implements Mock<PayeeModelMock> {
	private readonly payeeModel: PayeeModelMock;

	public constructor(
		payeeMockProvider: PayeeMockProvider,
		payeesMockProvider: PayeesMockProvider,
		$qMockProvider: QMockProvider,
	) {
		// Success/error = options for the stub promises
		const $q: QMock = $qMockProvider.$get(),
			success: PromiseMockConfig<{ data: Payee }> = {
				args: { id: 1 },
				response: { data: payeeMockProvider.$get() },
			},
			error: PromiseMockConfig<void> = {
				args: { id: -1 },
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
				return $q.promisify({ response: payee })() as SinonStub;
			},
			findLastTransaction: $q.promisify({ response: {} }, { args: -1 }),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			toggleFavourite(payee: Payee): SinonStub {
				return $q.promisify({ response: !payee.favourite })() as SinonStub;
			},
			flush: sinon.stub(),
			addRecent: sinon.stub(),
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

PayeeModelMockProvider.$inject = [
	"payeeMockProvider",
	"payeesMockProvider",
	"$qMockProvider",
];
