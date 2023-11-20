import type { Mock } from "~/mocks/types";
import type { PayeeModelMock } from "~/mocks/payees/types";
import type PayeeModelMockProvider from "~/mocks/payees/models/payee";

export default class ContextModelMockProvider implements Mock<PayeeModelMock> {
	public constructor(
		private readonly payeeModelMockProvider: PayeeModelMockProvider,
	) {}

	public $get(): PayeeModelMock {
		// Return the mock payeeModel object
		return this.payeeModelMockProvider.$get();
	}
}

ContextModelMockProvider.$inject = ["payeeModelMockProvider"];
