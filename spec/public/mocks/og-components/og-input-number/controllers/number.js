{
	/**
	 * Implementation
	 */
	class Provider {
		constructor() {}

		// Mock input number controller object
		ogInputNumberController() {
			this.type = "ogInputNumberController";
			this.formattedToRaw = sinon.stub().returnsArg(0);
			this.rawToFormatted = sinon.stub().returnsArg(0);
		}

		$get() {
			// Return the mock input number controller object
			return this.ogInputNumberController;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("ogInputNumberControllerMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = [];
}
