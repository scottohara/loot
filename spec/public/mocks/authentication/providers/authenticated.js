export default class AuthenticatedMockProvider {
	constructor() {
		// Mock authenticated status object
		this.authenticated = true;
	}

	$get() {
		// Return the mock authenticated status object
		return this.authenticated;
	}
}

AuthenticatedMockProvider.$inject = [];