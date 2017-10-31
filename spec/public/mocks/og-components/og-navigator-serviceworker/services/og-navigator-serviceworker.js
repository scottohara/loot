export default class OgNavigatorServiceWorkerServiceMockProvider {
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

OgNavigatorServiceWorkerServiceMockProvider.$inject = [];