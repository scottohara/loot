export default class ContextModelMockProvider {
	constructor(payeeModelMockProvider) {
		this.payeeModelMockProvider = payeeModelMockProvider;
	}

	$get() {
		// Return the mock payeeModel object
		return this.payeeModelMockProvider.$get();
	}
}

ContextModelMockProvider.$inject = ["payeeModelMockProvider"];