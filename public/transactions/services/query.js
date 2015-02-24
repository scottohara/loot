(function() {
	"use strict";

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

	/**
	 * Implementation
	 */
	function Service() {
		this.query = undefined;
	}
})();
