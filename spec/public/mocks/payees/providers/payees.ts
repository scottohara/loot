import { Mock } from "mocks/types";
import { Payee } from "payees/types";
import createPayee from "mocks/payees/factories";

export default class PayeesMockProvider implements Mock<Payee[]> {
	// Mock payees object
	public constructor(private readonly payees: Payee[] = [
		createPayee({ id: 1, name: "aa" }),
		createPayee({ id: 2, name: "bb" }),
		createPayee({ id: 3, name: "cc", num_transactions: 2 }),
		createPayee({ id: 4, name: "ba" }),
		createPayee({ id: 5, name: "ab" }),
		createPayee({ id: 6, name: "bc" }),
		createPayee({ id: 7, name: "ca" }),
		createPayee({ id: 8, name: "cb" }),
		createPayee({ id: 9, name: "ac" })
	]) {}

	public $get(): Payee[] {
		// Return the mock payees object
		return this.payees;
	}
}

PayeesMockProvider.$inject = [];