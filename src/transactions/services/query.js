{
	/**
	 * Implementation
	 */
	class Service {
		constructor() {
			this.query = null;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.service("queryService", Service);

	/**
	 * Dependencies
	 */
	Service.$inject = [];
}
