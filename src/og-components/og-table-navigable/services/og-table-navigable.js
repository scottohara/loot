(function() {
	"use strict";

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

	/**
	 * Implementation
	 */
	function Service() {
		// Enables/disables keyboard navigation on all navigable tables
		this.enabled = true;
	}
})();
