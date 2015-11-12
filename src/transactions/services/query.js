{
	/**
	 * Implementation
	 */
	class QueryService {
		constructor() {
			this.query = null;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.service("queryService", QueryService);

	/**
	 * Dependencies
	 */
	QueryService.$inject = [];
}
