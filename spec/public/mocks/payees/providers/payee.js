{
	/**
	 * Implementation
	 */
	class Provider {
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
		.provider("payeeMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = [];
}
