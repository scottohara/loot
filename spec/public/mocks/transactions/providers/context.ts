import { Mock } from "mocks/types";
import { Payee } from "payees/types";
import PayeeMockProvider from "mocks/payees/providers/payee";

export default class ContextMockProvider implements Mock<Payee> {
	public constructor(private readonly payeeMockProvider: PayeeMockProvider) {}

	public $get(): Payee {
		// Return the mock payee object
		return this.payeeMockProvider.$get();
	}
}

ContextMockProvider.$inject = ["payeeMockProvider"];