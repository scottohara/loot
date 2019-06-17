import { Mock } from "mocks/types";
import { Payee } from "payees/types";
import createPayee from "mocks/payees/factories";

export default class PayeeMockProvider implements Mock<Payee> {
	// Mock payee object
	public constructor(private readonly payee: Payee = createPayee({ id: 1, name: "aa" })) {}

	public $get(): Payee {
		// Return the mock payee object
		return this.payee;
	}
}

PayeeMockProvider.$inject = [];