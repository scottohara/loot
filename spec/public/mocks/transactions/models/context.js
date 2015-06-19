{
	/**
	 * Implementation
	 */
	class Provider {
		constructor(payeeModelMockProvider) {
			this.payeeModelMockProvider = payeeModelMockProvider;
		}

		$get() {
			// Return the mock payeeModel object
			return this.payeeModelMockProvider.$get();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactionsMocks")
		.provider("contextModelMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["payeeModelMockProvider"];
}
