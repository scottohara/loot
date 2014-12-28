(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogInputNumber controller
	mod.controller("ogInputNumberController", ["$scope",
		function($scope) {
			// Converts formatted value to raw value
			$scope.formattedToRaw = function(value) {
				return Number(value.replace(/[^0-9\-\.]/g, "")) || 0;
			};

			// Expose the formatting functions to other directives
			this.formattedToRaw = $scope.formattedToRaw;
			this.rawToFormatted = function(value) {
				return value;
			};
		}
	]);
})();
