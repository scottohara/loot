(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("schedules");

	// Declare the Estimate filter
	mod.filter("estimate", [
		function() {
			return function(value, isEstimate) {
				return (isEstimate ? "~" : "") + value;
			};
		}
	]);
})();
