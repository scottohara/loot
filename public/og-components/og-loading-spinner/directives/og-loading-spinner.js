(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogLoadingSpinner directive
	mod.directive("ogLoadingSpinner", [
		function() {
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
	]);
})();
