(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogLoadingSpinner", Directive);

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
			scope: {
				message: "=ogLoadingSpinner"
			},
			templateUrl: "og-components/og-loading-spinner/views/loading.html",
			link: function(scope) {
				scope.loadingMessage = scope.message || "Loading";
			}
		};
	}
})();
