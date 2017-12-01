import {Mock} from "mocks/types";
import {Security} from "securities/types";
import createSecurity from "mocks/securities/factories";

export default class SecuritiesMockProvider implements Mock<Security[]> {
	// Mock securities object
	public constructor(private readonly securities: Security[] = [
		createSecurity({id: 1, name: "aa", closing_balance: 1.006, code: "A", current_holding: 1}),
		createSecurity({id: 2, name: "bb", closing_balance: 2, code: "B", current_holding: 1}),
		createSecurity({id: 3, name: "cc", closing_balance: 3, code: "C", current_holding: 1, num_transactions: 2}),
		createSecurity({id: 4, name: "ba", closing_balance: 4, code: "D", current_holding: 1}),
		createSecurity({id: 5, name: "ab", closing_balance: 5, code: "E", current_holding: 1}),
		createSecurity({id: 6, name: "bc", closing_balance: 6, code: "F"}),
		createSecurity({id: 7, name: "ca", closing_balance: 7, code: "G", unused: true}),
		createSecurity({id: 8, name: "cb", closing_balance: 8, code: "H"}),
		createSecurity({id: 9, name: "ac", closing_balance: 9, code: "I", unused: true})
	]) {}

	public $get(): Security[] {
		// Return the mock securities object
		return this.securities;
	}
}

SecuritiesMockProvider.$inject = [];