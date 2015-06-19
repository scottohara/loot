{
	/**
	 * Implementation
	 */
	class Provider {
		constructor() {
			// Mock alert object
			this.alert = {message: "alert message"};
		}

		$get() {
			// Return the mock alert object
			return this.alert;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("alertMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = [];
}
