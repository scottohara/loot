export default class PayeesMockProvider {
	constructor() {
		// Mock payees object
		this.payees = [
			{id: 1, name: "aa"},
			{id: 2, name: "bb"},
			{id: 3, name: "cc", num_transactions: 2},
			{id: 4, name: "ba"},
			{id: 5, name: "ab"},
			{id: 6, name: "bc"},
			{id: 7, name: "ca"},
			{id: 8, name: "cb"},
			{id: 9, name: "ac"}
		];
	}

	$get() {
		// Return the mock payees object
		return this.payees;
	}
}

PayeesMockProvider.$inject = [];