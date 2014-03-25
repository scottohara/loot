(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('ogComponents');

	// Declare the ogInputCurrency directive
	mod.directive('ogInputCurrency', ['currencyFilter', 'numberFilter', '$timeout',
		function(currencyFilter, numberFilter, $timeout) {
			return {
				restrict: 'A',
				require: 'ngModel',
				scope: {
					decimalPlaces: '=ogInputCurrency'
				},
				link: function(scope, iElement, iAttrs, ngModel) {
					// Converts formatted value to raw value
					var formattedToRaw = function(value) {
						return Number(value.replace(/[^0-9\-\.]/g, '')) || 0;
					};

					// Converts raw value to formatted value
					var rawToFormatted = function(value) {
						return scope.decimalPlaces ? '$' + numberFilter(value || 0, scope.decimalPlaces) : currencyFilter(value || 0);
					};

					// View to model
					ngModel.$parsers.unshift(formattedToRaw);

					// Model to view
					ngModel.$formatters.unshift(rawToFormatted);

					// Update view when tabbing in/out of the field
					iElement.on('focus', function(event) {
						iElement.val(numberFilter(formattedToRaw(iElement.val()), scope.decimalPlaces || 2));
						$timeout(function() {
							$(iElement).select();
						}, 50);
					});
					iElement.on('blur', function() {
						iElement.val(rawToFormatted(formattedToRaw(iElement.val())));
					});
				}
			};
		}
	]);
})();
