(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the Table Navigable service
	mod.service("ogTableNavigableService", [
		function() {
			// Enables/disables keyboard navigation on all navigable tables
			this.enabled = true;
		}
	]);
})();
