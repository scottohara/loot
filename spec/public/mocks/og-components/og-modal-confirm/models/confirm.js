export default class ConfirmMockProvider {
	constructor() {
		// Mock confirm object
		this.confirm = {message: "confirm message"};
	}

	$get() {
		// Return the mock confirm object
		return this.confirm;
	}
}

ConfirmMockProvider.$inject = [];