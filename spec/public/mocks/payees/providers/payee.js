{
	/**
	 * Implementation
	 */
	class PayeeMockProvider {
		constructor() {
			// Mock payee object
			this.payee = {id: 1, name: "aa"};
		}

		$get() {
			// Return the mock payee object
			return this.payee;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootPayeesMocks")
		.provider("payeeMock", PayeeMockProvider);

	/**
	 * Dependencies
	 */
	PayeeMockProvider.$inject = [];
}
