(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogInputAutoselect directive
	mod.directive("ogInputAutoselect", ["$timeout",
		function($timeout) {
			return {
				restrict: "A",
				link: function(scope, iElement) {
					// Select the input value on focus
					iElement.on("focus", function() {
						$timeout(function() {
							$(iElement).select();
						}, 0);
					});
				}
			};
		}
	]);
})();
