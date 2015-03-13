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
	Service.$inject = ["$uiViewScroll"];

	/**
	 * Implementation
	 */
	function Service($uiViewScroll) {
		this.scrollTo = function(anchor) {
			$uiViewScroll($("#" + anchor));
		};
	}
})();
