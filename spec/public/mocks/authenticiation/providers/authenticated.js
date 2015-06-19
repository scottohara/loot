{
	/**
	 * Implementation
	 */
	class Provider {
		constructor() {
			// Mock authenticated status object
			this.authenticated = true;
		}

		$get() {
			// Return the mock authenticated status object
			return this.authenticated;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAuthenticationMocks")
		.provider("authenticatedMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = [];
}
