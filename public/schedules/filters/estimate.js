(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSchedules")
		.filter("estimate", Filter);

	/**
	 * Dependencies
	 */
	Filter.$inject = [];

	/**
	 * Implementation
	 */
	function Filter() {
		return function(value, isEstimate) {
			return (isEstimate ? "~" : "") + value;
		};
	}
})();
