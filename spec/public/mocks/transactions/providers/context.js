{
	/**
	 * Implementation
	 */
	class Provider {
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
		.provider("contextMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["payeeMockProvider"];
}
