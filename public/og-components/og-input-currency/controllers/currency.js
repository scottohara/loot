(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogInputCurrency controller
	mod.controller("ogInputCurrencyController", ["$scope", "numberFilter",
		function($scope, numberFilter) {
			// Default to 2 decimal places if not specified
			$scope.decimalPlaces = 2;

			$scope.setDecimalPlaces = function(decimalPlaces) {
				$scope.decimalPlaces = !!(decimalPlaces) && Number(decimalPlaces) || 2;
			};

			// Converts formatted value to raw value
			$scope.formattedToRaw = function(value) {
				return Number(value.replace(/[^0-9\-\.]/g, "")) || 0;
			};

			// Converts raw value to formatted value
			$scope.rawToFormatted = function(value) {
				value = numberFilter(!!(value) && Number(value) || 0, $scope.decimalPlaces);
				if (value.indexOf("-") === 0) {
					return "-$" + value.substring(1);
				} else {
					return "$" + value;
				}
			};

			// Expose the formatting functions to other directives
			this.formattedToRaw = $scope.formattedToRaw;
			this.rawToFormatted = $scope.rawToFormatted;
		}
	]);
})();
