{
	/**
	 * Implementation
	 */
	class ConfirmMockProvider {
		constructor() {
			// Mock confirm object
			this.confirm = {message: "confirm message"};
		}

		$get() {
			// Return the mock confirm object
			return this.confirm;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("confirmMock", ConfirmMockProvider);

	/**
	 * Dependencies
	 */
	ConfirmMockProvider.$inject = [];
}
