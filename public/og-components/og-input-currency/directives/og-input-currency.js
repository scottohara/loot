(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogInputCurrency directive
	mod.directive("ogInputCurrency", ["numberFilter",
		function(numberFilter) {
			return {
				restrict: "A",
				priority: 1,
				require: "ngModel",
				scope: {
					precision: "@ogInputCurrency"
				},
				controller: "ogInputCurrencyController",
				link: function(scope, iElement, iAttrs, ngModel) {
					// Set the decimal places
					scope.setDecimalPlaces(scope.precision);

					// View to model
					ngModel.$parsers.push(scope.formattedToRaw);

					// Model to view
					ngModel.$formatters.unshift(scope.rawToFormatted);

					var formattedToRaw = function() {
						iElement.val(numberFilter(scope.formattedToRaw(iElement.val()), scope.decimalPlaces));
					};

					var rawToFormatted = function() {
						iElement.val(scope.rawToFormatted(scope.formattedToRaw(iElement.val())));
					};

					// Update view when tabbing in/out of the field
					iElement.on("focus", formattedToRaw);
					iElement.on("blur", rawToFormatted);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", function() {
						iElement.off("focus", formattedToRaw);
						iElement.off("blur", rawToFormatted);
					});
				}
			};
		}
	]);
})();
