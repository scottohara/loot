export default class ContextMockProvider {
	constructor(payeeMockProvider) {
		this.payeeMockProvider = payeeMockProvider;
	}

	$get() {
		// Return the mock payee object
		return this.payeeMockProvider.$get();
	}
}

ContextMockProvider.$inject = ["payeeMockProvider"];