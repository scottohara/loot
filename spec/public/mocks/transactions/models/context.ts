import {Mock} from "mocks/types";
import {PayeeModelMock} from "mocks/payees/types";
import PayeeModelMockProvider from "mocks/payees/models/payee";

export default class ContextModelMockProvider implements Mock<PayeeModelMock> {
	public constructor(private readonly payeeModelMockProvider: PayeeModelMockProvider) {}

	public $get(): PayeeModelMock {
		// Return the mock payeeModel object
		return this.payeeModelMockProvider.$get();
	}
}

ContextModelMockProvider.$inject = ["payeeModelMockProvider"];