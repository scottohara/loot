(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogInputNumber directive
	mod.directive("ogInputNumber", ["numberFilter", "$timeout",
		function(numberFilter, $timeout) {
			return {
				restrict: "A",
				require: "ngModel",
				link: function(scope, iElement, iAttrs, ngModel) {
					// Converts formatted value to raw value
					var formattedToRaw = function(value) {
						return Number(value.replace(/[^0-9\-\.]/g, "")) || 0;
					};

					// View to model
					ngModel.$parsers.unshift(formattedToRaw);

					// Model to view
					ngModel.$formatters.unshift(function(value) {
						return numberFilter(!!(value) && Number(value) || 0);
					});

					// Update view when tabbing in/out of the field
					iElement.on("focus", function() {
						iElement.val(numberFilter(formattedToRaw(iElement.val())));
						$timeout(function() {
							$(iElement).select();
						}, 50);
					});
					iElement.on("blur", function() {
						iElement.val(numberFilter(formattedToRaw(iElement.val())));
					});
				}
			};
		}
	]);
})();
