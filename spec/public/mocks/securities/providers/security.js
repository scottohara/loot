export default class SecurityMockProvider {
	constructor() {
		// Mock security object
		this.security = {id: 1, name: "aa", closing_balance: 1.006, current_holding: 1, unused: false};
	}

	$get() {
		// Return the mock security object
		return this.security;
	}
}

SecurityMockProvider.$inject = [];