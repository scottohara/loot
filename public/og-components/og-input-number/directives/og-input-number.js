(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogInputNumber directive
	mod.directive("ogInputNumber", ["numberFilter",
		function(numberFilter) {
			return {
				restrict: "A",
				priority: 1,
				require: "ngModel",
				controller: "ogInputNumberController",
				link: function(scope, iElement, iAttrs, ngModel) {
					// View to model
					ngModel.$parsers.unshift(scope.formattedToRaw);

					// Model to view
					ngModel.$formatters.unshift(function(value) {
						return numberFilter(!!(value) && Number(value) || 0);
					});

					// Update view when tabbing in/out of the field
					iElement.on("focus", function() {
						iElement.val(numberFilter(scope.formattedToRaw(iElement.val())));
					});
					iElement.on("blur", function() {
						iElement.val(numberFilter(scope.formattedToRaw(iElement.val())));
					});
				}
			};
		}
	]);
})();
