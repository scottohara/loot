(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogTableLoading", Directive);

	/**
	 * Dependencies
	 */
	Directive.$inject = [];

	/**
	 * Implementation
	 */
	function Directive() {
		return {
			restrict: "A",
			replace: true,
			scope: {
				isLoading: "=ogTableLoading",
				colspan: "@"
			},
			templateUrl: "og-components/og-table-loading/views/loading.html"
		};
	}
})();
