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
					var select = function() {
						$timeout(function() {
							$(iElement).select();
						}, 0);
					};

					// Select the input value on focus
					iElement.on("focus", select);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", function() {
						iElement.off("focus", select);
					});
				}
			};
		}
	]);
})();
