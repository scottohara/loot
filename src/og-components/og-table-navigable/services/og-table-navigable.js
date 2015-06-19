{
	/**
	 * Implementation
	 */
	class Service {
		constructor() {
			// Enables/disables keyboard navigation on all navigable tables
			this.isEnabled = true;
		}

		get enabled() {
			return this.isEnabled;
		}

		set enabled(enabled) {
			this.isEnabled = enabled;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.service("ogTableNavigableService", Service);

	/**
	 * Dependencies
	 */
	Service.$inject = [];
}
