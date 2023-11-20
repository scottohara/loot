import type { Mock } from "~/mocks/types";
import type { Payee } from "~/payees/types";
import type PayeeMockProvider from "~/mocks/payees/providers/payee";

export default class ContextMockProvider implements Mock<Payee> {
	public constructor(private readonly payeeMockProvider: PayeeMockProvider) {}

	public $get(): Payee {
		// Return the mock payee object
		return this.payeeMockProvider.$get();
	}
}

ContextMockProvider.$inject = ["payeeMockProvider"];
