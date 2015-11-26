{
	/**
	 * Implementation
	 */
	class OgNavigatorServiceWorkerServiceMockProvider {
		constructor() {
			this.ogNavigatorServiceWorkerService = {
				register: sinon.stub()
			};
		}

		$get() {
			// Return the mock confirm object
			return this.ogNavigatorServiceWorkerService;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("ogNavigatorServiceWorkerServiceMock", OgNavigatorServiceWorkerServiceMockProvider);

	/**
	 * Dependencies
	 */
	OgNavigatorServiceWorkerServiceMockProvider.$inject = [];
}
