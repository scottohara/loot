{
	/**
	 * Implementation
	 */
	class ContextMockProvider {
		constructor(payeeMockProvider) {
			this.payeeMockProvider = payeeMockProvider;
		}

		$get() {
			// Return the mock payee object
			return this.payeeMockProvider.$get();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactionsMocks")
		.provider("contextMock", ContextMockProvider);

	/**
	 * Dependencies
	 */
	ContextMockProvider.$inject = ["payeeMockProvider"];
}
