(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.service("ogViewScrollService", Service);

	/**
	 * Dependencies
	 */
	Service.$inject = ["$anchorScroll"];

	/**
	 * Implementation
	 */
	function Service($anchorScroll) {
		this.scrollTo = function(anchor) {
			$anchorScroll(anchor);
		};
	}
})();
