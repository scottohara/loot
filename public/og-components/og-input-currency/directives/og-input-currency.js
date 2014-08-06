(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogInputCurrency directive
	mod.directive("ogInputCurrency", ["currencyFilter", "numberFilter", "$timeout",
		function(currencyFilter, numberFilter, $timeout) {
			return {
				restrict: "A",
				require: "ngModel",
				scope: {
					decimalPlaces: "@ogInputCurrency"
				},
				link: function(scope, iElement, iAttrs, ngModel) {
					// Default to 2 decimal places if not specified
					var decimalPlaces = !!(scope.decimalPlaces) && Number(scope.decimalPlaces) || 2;

					// Converts formatted value to raw value
					var formattedToRaw = function(value) {
						return Number(value.replace(/[^0-9\-\.]/g, "")) || 0;
					};

					// Converts raw value to formatted value
					var rawToFormatted = function(value) {
						value = numberFilter(!!(value) && Number(value) || 0, decimalPlaces);
						if (value.indexOf("-") === 0) {
							return "-$" + value.substring(1);
						} else {
							return "$" + value;
						}
					};

					// View to model
					ngModel.$parsers.unshift(formattedToRaw);

					// Model to view
					ngModel.$formatters.unshift(rawToFormatted);

					// Update view when tabbing in/out of the field
					iElement.on("focus", function() {
						iElement.val(numberFilter(formattedToRaw(iElement.val()), decimalPlaces));
						$timeout(function() {
							$(iElement).select();
						}, 50);
					});
					iElement.on("blur", function() {
						iElement.val(rawToFormatted(formattedToRaw(iElement.val())));
					});
				}
			};
		}
	]);
})();
