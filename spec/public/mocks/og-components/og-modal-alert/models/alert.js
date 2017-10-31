export default class AlertMockProvider {
	constructor() {
		// Mock alert object
		this.alert = {message: "alert message"};
	}

	$get() {
		// Return the mock alert object
		return this.alert;
	}
}

AlertMockProvider.$inject = [];