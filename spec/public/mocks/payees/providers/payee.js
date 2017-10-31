export default class PayeeMockProvider {
	constructor() {
		// Mock payee object
		this.payee = {id: 1, name: "aa"};
	}

	$get() {
		// Return the mock payee object
		return this.payee;
	}
}

PayeeMockProvider.$inject = [];