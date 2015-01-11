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
					ngModel.$parsers.push(scope.formattedToRaw);

					// Model to view
					ngModel.$formatters.unshift(function(value) {
						return numberFilter(!!(value) && Number(value) || 0);
					});

					var formattedToRaw = function() {
						iElement.val(numberFilter(scope.formattedToRaw(iElement.val())));
					};

					// Update view when tabbing in/out of the field
					iElement.on("focus", formattedToRaw);
					iElement.on("blur", formattedToRaw);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", function() {
						iElement.off("focus", formattedToRaw);
						iElement.off("blur", formattedToRaw);
					});
				}
			};
		}
	]);
})();
