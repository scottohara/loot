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
				controller: "OgInputCurrencyController",
				controllerAs: "vm",
				bindToController: true,
				link: function(scope, iElement, iAttrs, ngModel) {
					// Set the decimal places
					scope.vm.setDecimalPlaces(scope.vm.precision);

					// View to model
					ngModel.$parsers.push(scope.vm.formattedToRaw);

					// Model to view
					ngModel.$formatters.unshift(scope.vm.rawToFormatted);

					var formattedToRaw = function() {
						iElement.val(numberFilter(scope.vm.formattedToRaw(iElement.val()), scope.vm.decimalPlaces));
					};

					var rawToFormatted = function() {
						iElement.val(scope.vm.rawToFormatted(scope.vm.formattedToRaw(iElement.val())));
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
